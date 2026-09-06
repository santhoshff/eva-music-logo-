import { Track } from '../types';

export interface EvaBrainPersona {
  genreAffinities: Record<string, number>;
  artistScores: Record<string, number>;
  totalListenTimeSeconds: number;
  skipPenalties: Record<string, number>;
  isEnabled: boolean;
}

export type EchoBrainPersona = EvaBrainPersona;

export interface EvaBrainRecommendation {
  track: Track;
  reason: string;
  score: number;
  matchPercentage: number;
}

export type EchoBrainRecommendation = EvaBrainRecommendation;

const STORAGE_KEY = 'eva_brain_persona_v1';

class EvaBrainService {
  private persona: EvaBrainPersona = {
    genreAffinities: {
      'Tamil Trending': 8.5,
      'Mass Anthems': 7.2,
      'Indie Pop & Chill': 9.0,
      'Tamil Indie Pop': 8.8,
    },
    artistScores: {
      'Sai Abhyankkar': 9.5,
      'Anirudh Ravichander': 9.2,
      'Thalapathy Vijay': 8.7,
    },
    totalListenTimeSeconds: 14200,
    skipPenalties: {},
    isEnabled: true,
  };

  private prevTrack: Track | null = null;
  private currentTrackStartTime: number = 0;

  constructor() {
    this.loadPersona();
  }

  private loadPersona() {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('eva_echo_brain_persona_v1');
        if (raw) {
          this.persona = { ...this.persona, ...JSON.parse(raw) };
        }
      } catch {
        // Fallback to default persona
      }
    }
  }

  private savePersona() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.persona));
      } catch {
        // Ignore storage errors
      }
    }
  }

  public isEnabled(): boolean {
    return this.persona.isEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.persona.isEnabled = enabled;
    this.savePersona();
  }

  public getPersona(): EvaBrainPersona {
    return { ...this.persona };
  }

  /**
   * Neural Ranking & Runway Generator (Pillars: Anchor, Momentum, Vault)
   */
  public getRunwayRecommendations(
    currentTrack: Track | null,
    activeQueue: Track[],
    availableTracks: Track[],
    count: number = 3
  ): EvaBrainRecommendation[] {
    if (!this.persona.isEnabled || !currentTrack) return [];

    const activeIds = new Set(activeQueue.map(t => t.id));

    // Candidates pool
    const candidates = availableTracks.filter(t => !activeIds.has(t.id) && t.id !== currentTrack.id);

    const scored: EvaBrainRecommendation[] = candidates.map(track => {
      let score = 5.0; // Base score

      const genreAffinity = this.persona.genreAffinities[track.genre] || 5.0;
      const artistScore = this.persona.artistScores[track.artist] || 4.0;
      const skipPenalty = this.persona.skipPenalties[track.id] || 0;

      // Same genre bonus
      if (track.genre === currentTrack.genre) {
        score += 2.5;
      }

      // Same artist / related artist momentum
      if (track.artist === currentTrack.artist) {
        score += 2.0;
      }

      score += genreAffinity * 0.4;
      score += artistScore * 0.3;
      score -= skipPenalty * 2.0;

      if (track.isLiked) {
        score += 1.5;
      }

      const matchPercentage = Math.min(99, Math.max(65, Math.round(score * 8.5)));

      let reason = 'Selected for your current audio flow';
      if (track.genre === currentTrack.genre && track.artist === currentTrack.artist) {
        reason = `Deep cut from ${track.artist}`;
      } else if (track.genre === currentTrack.genre) {
        reason = `Flowing into ${track.genre} frequency`;
      } else if (track.isLiked) {
        reason = 'Heavy rotation from your favorites';
      }

      return {
        track: {
          ...track,
          isEvaBrain: true,
          evaBrainReason: reason,
          isEchoBrain: true,
          echoBrainReason: reason,
        },
        reason,
        score,
        matchPercentage,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, count);
  }

  /**
   * Records user listening behavior to train affinities
   */
  public recordTrackStart(track: Track) {
    this.prevTrack = track;
    this.currentTrackStartTime = Date.now();
  }

  public recordTrackFinished(track: Track, listenDurationSeconds: number) {
    if (!this.persona.isEnabled) return;

    this.persona.totalListenTimeSeconds += listenDurationSeconds;

    // Positive reinforcement for full listen
    const currentGenreScore = this.persona.genreAffinities[track.genre] || 5.0;
    this.persona.genreAffinities[track.genre] = Math.min(10, currentGenreScore + 0.15);

    const currentArtistScore = this.persona.artistScores[track.artist] || 5.0;
    this.persona.artistScores[track.artist] = Math.min(10, currentArtistScore + 0.2);

    this.savePersona();
  }

  public recordTrackSkipped(track: Track, playedSeconds: number) {
    if (!this.persona.isEnabled) return;

    // Severe skip penalty if skipped in under 20 seconds
    if (playedSeconds < 20) {
      const currentPenalty = this.persona.skipPenalties[track.id] || 0;
      this.persona.skipPenalties[track.id] = currentPenalty + 1;

      // Slight dampening on genre affinity
      const currentGenreScore = this.persona.genreAffinities[track.genre] || 5.0;
      this.persona.genreAffinities[track.genre] = Math.max(1, currentGenreScore - 0.1);

      this.savePersona();
    }
  }

  public recordLikeToggled(track: Track, isLiked: boolean) {
    if (!this.persona.isEnabled) return;

    const delta = isLiked ? 0.4 : -0.2;
    const currentGenreScore = this.persona.genreAffinities[track.genre] || 5.0;
    this.persona.genreAffinities[track.genre] = Math.min(10, Math.max(1, currentGenreScore + delta));

    const currentArtistScore = this.persona.artistScores[track.artist] || 5.0;
    this.persona.artistScores[track.artist] = Math.min(10, Math.max(1, currentArtistScore + delta * 1.2));

    this.savePersona();
  }

  /**
   * Alias helper for recordLike
   */
  public recordLike(track: Track, isLiked: boolean) {
    this.recordLikeToggled(track, isLiked);
  }

  /**
   * Derive Personalized Trending Tracks
   */
  public getPersonalizedTrendingTracks(
    availableTracks: Track[],
    count: number = 6,
    seedOffset: number = 0
  ): Track[] {
    if (!availableTracks || availableTracks.length === 0) return [];

    // 1. Calculate neural score for all candidate tracks
    const scoredCandidates = availableTracks.map((track, idx) => {
      const genreAffinity = this.persona.genreAffinities[track.genre] || 5.0;
      const artistScore = this.persona.artistScores[track.artist] || 4.0;
      const skipPenalty = this.persona.skipPenalties[track.id] || 0;

      // Entropy jitter based on seedOffset for on-demand refresh
      const jitter = seedOffset > 0 ? (Math.sin(idx * 17 + seedOffset * 31) + 1) * 1.8 : 0;
      const likeBonus = track.isLiked ? 2.5 : 0;

      const score = genreAffinity * 0.45 + artistScore * 0.35 + likeBonus - skipPenalty * 1.5 + jitter;
      return { track, score };
    });

    // 2. Sort candidates by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 3. Strict diversity filtering: Unique coverUrl, Unique Title, Max 1 track per artist
    const seenCovers = new Set<string>();
    const seenTitles = new Set<string>();
    const seenArtists = new Set<string>();
    const result: Track[] = [];

    for (const item of scoredCandidates) {
      const { track } = item;
      const cover = (track.coverUrl || '').trim();
      const normTitle = (track.title || '').toLowerCase().trim();
      const normArtist = (track.artist || '').toLowerCase().trim();

      // Guard against identical covers
      if (cover && seenCovers.has(cover)) continue;
      if (normTitle && seenTitles.has(normTitle)) continue;
      if (normArtist && seenArtists.has(normArtist)) continue;

      if (cover) seenCovers.add(cover);
      if (normTitle) seenTitles.add(normTitle);
      if (normArtist) seenArtists.add(normArtist);

      result.push({
        ...track,
        isEvaBrain: true,
        evaBrainReason: `Curated for your ${track.genre} taste by Eva Brain`,
        isEchoBrain: true,
        echoBrainReason: `Curated for your ${track.genre} taste by Eva Brain`,
      });

      if (result.length >= count) break;
    }

    // 4. If strict artist filter was too narrow to reach count, fill remaining with unique covers
    if (result.length < count) {
      for (const item of scoredCandidates) {
        const { track } = item;
        const cover = (track.coverUrl || '').trim();
        const normTitle = (track.title || '').toLowerCase().trim();

        if (cover && seenCovers.has(cover)) continue;
        if (normTitle && seenTitles.has(normTitle)) continue;

        if (cover) seenCovers.add(cover);
        if (normTitle) seenTitles.add(normTitle);

        result.push({
          ...track,
          isEvaBrain: true,
          evaBrainReason: `Curated for your ${track.genre} taste by Eva Brain`,
          isEchoBrain: true,
          echoBrainReason: `Curated for your ${track.genre} taste by Eva Brain`,
        });
        if (result.length >= count) break;
      }
    }

    return result;
  }

  /**
   * Generates exactly 20 personalized tracks tailored to the user's taste and listening habits
   */
  public getUserTasteTop20Tracks(availableTracks: Track[]): (Track & { rank: number; tasteTag: string })[] {
    if (!availableTracks || availableTracks.length === 0) return [];

    const tasteTags = [
      '99% Vibe Match • On Repeat',
      'Heavy Rotation • Daily Jam',
      'Top Mass Anthem • 98% Match',
      'Indie Romance Favorite',
      'High Energy Boost',
      'Frequent Replay • 96% Match',
      'Gym & Drive Motivation',
      'Late Night Acoustic Calm',
      'Adrenaline Rush',
      'Trending Club Vibe',
      'Dance Floor Spark',
      'Soulful Melody Favorite',
      'Mass Swagger',
      'Evergreen Classic Touch',
      'Party Catalyst',
      'Deep Emotional Chill',
      'Groove Supreme',
      'Cinematic Power',
      'Feel-Good Rhythm',
      'Acoustic Bliss & Peace'
    ];

    // Score all candidate tracks
    const scoredCandidates = availableTracks.map((track, idx) => {
      const genreAffinity = this.persona.genreAffinities[track.genre] || 6.0;
      const artistScore = this.persona.artistScores[track.artist] || 5.0;
      const likeBonus = track.isLiked ? 3.0 : 0;
      const skipPenalty = this.persona.skipPenalties[track.id] || 0;
      const baseScore = genreAffinity * 0.45 + artistScore * 0.35 + likeBonus - skipPenalty * 1.5;
      return { track, score: baseScore - (idx * 0.05) };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    const seenIds = new Set<string>();
    const top20: (Track & { rank: number; tasteTag: string })[] = [];

    for (let i = 0; i < scoredCandidates.length; i++) {
      const { track } = scoredCandidates[i];
      if (seenIds.has(track.id)) continue;
      seenIds.add(track.id);

      const rank = top20.length + 1;
      const tasteTag = tasteTags[top20.length] || `Rank #${rank} • Recommended`;

      top20.push({
        ...track,
        rank,
        tasteTag,
        isEvaBrain: true,
        evaBrainReason: `Rank #${rank} • ${tasteTag}`,
        isEchoBrain: true,
        echoBrainReason: `Rank #${rank} • ${tasteTag}`,
      });

      if (top20.length >= 20) break;
    }

    return top20;
  }
}

export const evaBrainService = new EvaBrainService();
export const echoBrainService = evaBrainService;
export { EvaBrainService as EchoBrainService };
