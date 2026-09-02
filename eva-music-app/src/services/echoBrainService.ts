import { Track } from '../types';

export interface EchoBrainPersona {
  genreAffinities: Record<string, number>;
  artistScores: Record<string, number>;
  totalListenTimeSeconds: number;
  skipPenalties: Record<string, number>;
  isEnabled: boolean;
}

export interface EchoBrainRecommendation {
  track: Track;
  reason: string;
  score: number;
  matchPercentage: number;
}

const STORAGE_KEY = 'eva_echo_brain_persona_v1';

class EchoBrainService {
  private persona: EchoBrainPersona = {
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
        const raw = localStorage.getItem(STORAGE_KEY);
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

  public getPersona(): EchoBrainPersona {
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
  ): EchoBrainRecommendation[] {
    if (!this.persona.isEnabled || !currentTrack) return [];

    const activeIds = new Set(activeQueue.map(t => t.id));

    // Candidates pool
    const candidates = availableTracks.filter(t => !activeIds.has(t.id) && t.id !== currentTrack.id);

    const scored: EchoBrainRecommendation[] = candidates.map(track => {
      let score = 5.0; // Base score

      const genreAffinity = this.persona.genreAffinities[track.genre] || 5.0;
      const artistScore = this.persona.artistScores[track.artist] || 4.0;
      const skipPenalty = this.persona.skipPenalties[track.id] || 0;

      score += genreAffinity * 0.4 + artistScore * 0.3 - skipPenalty * 1.5;

      // Anchor bonus (matches current track genre/artist)
      let reason = `Recommended based on your ${track.genre} preference`;
      if (track.genre.toLowerCase() === currentTrack.genre.toLowerCase()) {
        score += 3.0;
        reason = `Matches current sonic vibe of "${currentTrack.title}" (${track.genre})`;
      } else if (track.artist.toLowerCase() === currentTrack.artist.toLowerCase()) {
        score += 2.5;
        reason = `Same artist momentum (${track.artist})`;
      } else if (this.prevTrack && track.genre.toLowerCase() === this.prevTrack.genre.toLowerCase()) {
        score += 2.0;
        reason = `Contextual bridge from previous track "${this.prevTrack.title}"`;
      } else if (track.isLiked) {
        score += 1.8;
        reason = `Grounded in your vault top favorites`;
      }

      const matchPercentage = Math.min(99, Math.max(75, Math.round(score * 7.5 + 25)));

      return {
        track: {
          ...track,
          isEchoBrain: true,
          echoBrainReason: reason,
        },
        reason,
        score,
        matchPercentage,
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, count);
  }

  /**
   * Monitor track transition & apply listening duration / skip penalty
   */
  public onTrackTransition(newTrack: Track | null, currentTrack: Track | null, listenDurationSeconds: number) {
    if (currentTrack) {
      if (listenDurationSeconds < 15 && listenDurationSeconds > 0) {
        // Skip Penalty
        this.persona.skipPenalties[currentTrack.id] = (this.persona.skipPenalties[currentTrack.id] || 0) + 1;
        this.persona.genreAffinities[currentTrack.genre] = Math.max(1, (this.persona.genreAffinities[currentTrack.genre] || 5) - 0.3);
      } else if (listenDurationSeconds >= 30) {
        // Positive Affinity Boost
        this.persona.genreAffinities[currentTrack.genre] = Math.min(10, (this.persona.genreAffinities[currentTrack.genre] || 5) + 0.4);
        this.persona.artistScores[currentTrack.artist] = Math.min(10, (this.persona.artistScores[currentTrack.artist] || 4) + 0.3);
        this.persona.totalListenTimeSeconds += Math.round(listenDurationSeconds);
      }
      this.prevTrack = currentTrack;
      this.savePersona();
    }

    this.currentTrackStartTime = Date.now();
  }
}

export const echoBrainService = new EchoBrainService();
