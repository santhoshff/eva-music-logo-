/**
 * EVA AI Music - Native High-Fidelity Audio Engine
 * Plays authentic song streams directly via HTML5 Audio with instant buffering,
 * MediaSession lock screen integration, and zero random BGM fallbacks.
 */

import { apiRecordHistory } from './backendApi';
import { INITIAL_TRACKS } from '../data/musicData';

type Listener = () => void;
type TrackEndCallback = () => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private isPlaying = false;
  private isLoading = false;
  private currentTime = 0;
  private duration = 218;
  private volume = 0.8;
  private isMuted = false;
  private isShuffle = false;
  private repeatMode: 'off' | 'all' | 'one' = 'off';
  private equalizerPreset: 'normal' | 'bass' | 'vocal' | 'lofi' = 'bass';
  private listeners: Listener[] = [];
  private onTrackEndCallback: TrackEndCallback | null = null;
  private rawAudioUrl: string = '';
  private currentFallbackUrl: string | null = null;
  private hasPlaybackError: boolean = false;
  private currentRequestId = 0;
  private pendingResumeCleanup: (() => void) | null = null;

  private isEndedHandled = false;
  private mediaCallbacks: {
    onNext?: () => void;
    onPrev?: () => void;
    onTogglePlay?: () => void;
    onSeek?: (secs: number) => void;
  } = {};
  private currentMediaTrack: { title: string; artist: string; album?: string; coverUrl?: string } | null = null;
  private lastPositionSyncTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.id = 'eva-music-native-audio';
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;
    this.audio.muted = this.isMuted;

    if (typeof document !== 'undefined' && document.body && !document.getElementById('eva-music-native-audio')) {
      this.audio.style.display = 'none';
      document.body.appendChild(this.audio);
    }

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.isLoading = false;
      this.hasPlaybackError = false;
      this.syncPlaybackState('playing');
      this.updatePositionState(true);
      this.notify();
    });

    this.audio.addEventListener('playing', () => {
      this.isPlaying = true;
      this.isLoading = false;
      this.hasPlaybackError = false;
      this.syncPlaybackState('playing');
      this.updatePositionState(true);
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.syncPlaybackState('paused');
      this.updatePositionState(true);
      this.notify();
    });

    this.audio.addEventListener('waiting', () => {
      this.isLoading = true;
      this.notify();
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading = false;
      this.hasPlaybackError = false;
      if (this.audio && this.audio.duration && !Number.isNaN(this.audio.duration)) {
        this.duration = this.audio.duration;
        this.updatePositionState(true);
      }
      this.notify();
    });

    this.audio.addEventListener('durationchange', () => {
      if (this.audio && this.audio.duration && !Number.isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.duration = this.audio.duration;
        this.updatePositionState(true);
        this.notify();
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && !Number.isNaN(this.audio.currentTime)) {
        this.currentTime = this.audio.currentTime;
        this.updatePositionState(false);
        this.notify();
      }
    });

    this.audio.addEventListener('ended', () => {
      this.syncPlaybackState('paused');
      this.handleTrackEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn(`[AudioEngine] Audio error for track ${this.currentTrackId}:`, this.audio?.error || e);
      
      // If stream proxy failed, fall back to direct CDN
      if (this.audio && this.audio.src.includes('/api/stream') && this.rawAudioUrl && this.rawAudioUrl.startsWith('http') && !this.rawAudioUrl.includes('/api/stream')) {
        console.log(`[AudioEngine] Stream proxy error. Falling back directly to CDN:`, this.rawAudioUrl);
        this.audio.src = this.rawAudioUrl;
        this.audio.play().catch(err => console.warn('[AudioEngine] Direct CDN fallback failed:', err.message));
        return;
      }

      // If direct CDN stream failed, fail over to serverless stream proxy
      if (this.rawAudioUrl && this.rawAudioUrl.includes('saavncdn.com') && this.audio && !this.audio.src.includes('/api/stream')) {
        const proxyUrl = `/api/stream?url=${encodeURIComponent(this.rawAudioUrl)}`;
        console.log(`[AudioEngine] Direct CDN error. Switching to serverless stream proxy:`, proxyUrl);
        this.audio.src = proxyUrl;
        this.audio.play().catch(err => console.warn('[AudioEngine] Proxy playback failed:', err.message));
        return;
      }

      // Attempt secondary fallback stream before concluding failure
      if (this.currentFallbackUrl && this.audio && this.audio.src !== this.currentFallbackUrl) {
        const fallback = this.currentFallbackUrl;
        this.currentFallbackUrl = null;
        console.log(`[AudioEngine] Attempting fallback stream for ${this.currentTrackId}:`, fallback);
        this.audio.src = this.getEffectiveStreamUrl(fallback) || fallback;
        this.audio.play().catch(err => console.warn('[AudioEngine] Fallback play failed:', err.message));
        return;
      }

      this.isLoading = false;
      this.isPlaying = false;
      this.hasPlaybackError = true;
      this.syncPlaybackState('paused');
      this.notify();
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public setOnTrackEnd(callback: TrackEndCallback | null) {
    this.onTrackEndCallback = callback;
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (e) {
        console.error('[AudioEngine] Listener error:', e);
      }
    });
  }

  public getEffectiveStreamUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();
    // Absolutely ban any 30s preview URLs
    if (
      trimmed.includes('apple.com') ||
      trimmed.includes('mzstatic') ||
      trimmed.includes('itunes') ||
      trimmed.includes('preview')
    ) {
      return '';
    }
    // Return authentic high-fidelity stream directly
    return trimmed;
  }

  public playTrack(
    trackId: string,
    audioUrl?: string,
    durationSeconds: number = 218,
    fallbackAudioUrl?: string,
    _genre?: string,
    trackTitle?: string,
    trackArtist?: string
  ) {
    const requestId = ++this.currentRequestId;

    // Cancel any stale autoplay-retry touch listener from a previous track
    if (this.pendingResumeCleanup) {
      this.pendingResumeCleanup();
      this.pendingResumeCleanup = null;
    }

    this.currentTrackId = trackId;
    this.currentTime = 0;
    this.duration = durationSeconds > 0 ? durationSeconds : 218;
    this.isLoading = true;
    this.hasPlaybackError = false;
    this.isEndedHandled = false;
    this.currentFallbackUrl = fallbackAudioUrl?.trim() || null;
    this.notify();

    this.initAudioElement();
    if (!this.audio) return;

    let streamUrl = (audioUrl && audioUrl.trim().length > 0) ? audioUrl.trim() : '';

    // Check if running on a deployed host (not local localhost)
    const isDeployedClient = typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1';

    // If streamUrl points to localhost in a deployed environment, switch to fallback if available
    if (isDeployedClient && streamUrl.includes('localhost:8080') && fallbackAudioUrl && fallbackAudioUrl.startsWith('http')) {
      streamUrl = fallbackAudioUrl.trim();
    }

    // Never play 30s Apple/iTunes previews: Resolve full 320kbps track first!
    const isPreviewOrEmpty = !streamUrl || 
      streamUrl.includes('apple.com') || 
      streamUrl.includes('mzstatic') || 
      streamUrl.includes('itunes') || 
      streamUrl.includes('preview');

    if (isPreviewOrEmpty) {
      // 1. Direct match from curated 320kbps catalog
      const cleanTrackId = (trackId || '').toLowerCase().trim();
      const normTitle = (trackTitle || '').toLowerCase().trim();
      const catalogMatch = INITIAL_TRACKS.find(m => 
        m.id === cleanTrackId || 
        (normTitle.length > 3 && m.title.toLowerCase().includes(normTitle)) ||
        (cleanTrackId.length > 5 && m.id.includes(cleanTrackId))
      );
      if (catalogMatch && catalogMatch.audioUrl) {
        console.log(`[AudioEngine] Resolved full-length master track from catalog for ${trackId}:`, catalogMatch.audioUrl);
        this.playDirectStream(catalogMatch.audioUrl, catalogMatch.durationSeconds || 240, requestId, trackId);
        return;
      }

      // 2. Query serverless /api/search for on-demand 320kbps resolution
      const query = (trackTitle || trackId)
        .replace(/^(tamil|south|track|global)-/i, '')
        .replace(/-/g, ' ')
        .replace(/\(From.*?\)/gi, '')
        .trim();

      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
          if (requestId !== this.currentRequestId || !this.audio) return;
          const fullMatch = data.results?.find((r: any) => r.audioUrl && r.audioUrl.includes('saavncdn.com'));
          if (fullMatch && fullMatch.audioUrl) {
            console.log(`[AudioEngine] Resolved full-length 320kbps track via search for ${trackId}:`, fullMatch.audioUrl);
            this.playDirectStream(fullMatch.audioUrl, fullMatch.durationSeconds || 240, requestId, trackId);
          } else {
            // Fall back to a guaranteed 320kbps catalog hit rather than ever playing a 30s preview clip
            const masterFallback = INITIAL_TRACKS[0];
            this.playDirectStream(masterFallback.audioUrl, masterFallback.durationSeconds, requestId, trackId);
          }
        })
        .catch(() => {
          const masterFallback = INITIAL_TRACKS[0];
          this.playDirectStream(masterFallback.audioUrl, masterFallback.durationSeconds, requestId, trackId);
        });
      return;
    }

    this.playDirectStream(streamUrl, durationSeconds, requestId, trackId);
  }

  private playDirectStream(streamUrl: string, durationSecs: number, requestId: number, trackId: string) {
    if (!this.audio || requestId !== this.currentRequestId) return;
    this.rawAudioUrl = streamUrl;
    const playUrl = this.getEffectiveStreamUrl(streamUrl) || streamUrl;
    this.duration = durationSecs > 0 ? durationSecs : 218;

    console.log(`[AudioEngine] Playing authentic track #${requestId} [${trackId}]: ${playUrl}`);

    try {
      if (this.audio.src !== playUrl) {
        this.audio.src = playUrl;
      } else {
        this.audio.currentTime = 0;
      }

      const attemptPlay = () => {
        if (requestId !== this.currentRequestId || !this.audio) return;
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (requestId !== this.currentRequestId) return;
              this.isPlaying = true;
              this.isLoading = false;
              this.syncPlaybackState('playing');
              this.updatePositionState(true);
              this.notify();
            })
            .catch(err => {
              if (requestId !== this.currentRequestId) return;
              if (err.name === 'AbortError' || err.name === 'NotSupportedError') {
                const onCanPlay = () => {
                  if (requestId === this.currentRequestId && this.audio) {
                    this.audio.play().then(() => {
                      this.isPlaying = true;
                      this.isLoading = false;
                      this.syncPlaybackState('playing');
                      this.updatePositionState(true);
                      this.notify();
                    }).catch(() => {});
                  }
                };
                this.audio?.addEventListener('canplay', onCanPlay, { once: true });
                return;
              }

              console.warn(`[AudioEngine] Autoplay prevented:`, err.message);
              const resumeOnTouch = () => {
                // Only resume if this request is still the active one
                if (this.audio && requestId === this.currentRequestId) {
                  this.audio.play().then(() => {
                    this.isPlaying = true;
                    this.isLoading = false;
                    this.notify();
                  }).catch(() => {});
                }
                window.removeEventListener('click', resumeOnTouch);
                window.removeEventListener('touchstart', resumeOnTouch);
                if (this.pendingResumeCleanup === cleanup) {
                  this.pendingResumeCleanup = null;
                }
              };
              const cleanup = () => {
                window.removeEventListener('click', resumeOnTouch);
                window.removeEventListener('touchstart', resumeOnTouch);
              };
              this.pendingResumeCleanup = cleanup;
              window.addEventListener('click', resumeOnTouch, { once: true });
              window.addEventListener('touchstart', resumeOnTouch, { once: true });
              this.isLoading = false;
              this.notify();
            });
        }
      };

      attemptPlay();
    } catch (err) {
      console.error('[AudioEngine] Play execution error:', err);
      this.isLoading = false;
      this.isPlaying = false;
      this.notify();
    }
  }

  public loadTrack(
    trackId: string,
    audioUrl?: string,
    durationSeconds: number = 218,
    _fallbackAudioUrl?: string,
    _genre?: string
  ) {
    this.currentTrackId = trackId;
    this.currentTime = 0;
    this.duration = durationSeconds > 0 ? durationSeconds : 218;
    this.isLoading = false;
    this.isPlaying = false;
    let streamUrl = (audioUrl && audioUrl.trim().length > 0) ? audioUrl.trim() : '';
    if (!streamUrl && trackId) {
      streamUrl = `/api/stream/${encodeURIComponent(trackId)}`;
    }
    if (streamUrl.startsWith('/api/') && !streamUrl.startsWith('/api/stream?')) {
      const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      streamUrl = `${backendBase.replace(/\/api\/?$/, '')}${streamUrl}`;
    }
    const playUrl = this.getEffectiveStreamUrl(streamUrl) || streamUrl;
    this.rawAudioUrl = streamUrl;
    this.initAudioElement();
    if (this.audio && playUrl) {
      this.audio.src = playUrl;
      this.audio.currentTime = 0;
    }
    this.notify();
  }

  public play() {
    this.initAudioElement();
    if (!this.audio) return;
    if (!this.isPlaying) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.syncPlaybackState('playing');
        this.updatePositionState(true);
        this.notify();
      }).catch(e => console.warn('[AudioEngine] Play error:', e));
    }
  }

  public pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.syncPlaybackState('paused');
      this.updatePositionState(true);
      this.notify();
    }
  }

  public togglePlay() {
    this.initAudioElement();
    if (!this.audio) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      if (!this.audio.src && this.currentTrackId) {
        this.playTrack(this.currentTrackId, this.rawAudioUrl, this.duration);
      } else {
        this.play();
      }
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
    if (this.audio && !Number.isNaN(seconds)) {
      try {
        this.audio.currentTime = this.currentTime;
      } catch (e) {
        console.warn('[AudioEngine] Seek error:', e);
      }
    }
    this.updatePositionState(true);
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.muted = this.isMuted;
    }
    this.notify();
  }

  public toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.notify();
  }

  public toggleRepeat() {
    if (this.repeatMode === 'off') this.repeatMode = 'all';
    else if (this.repeatMode === 'all') this.repeatMode = 'one';
    else this.repeatMode = 'off';
    this.notify();
  }

  public setEqualizerPreset(preset: 'normal' | 'bass' | 'vocal' | 'lofi') {
    this.equalizerPreset = preset;
    this.notify();
  }

  private handleTrackEnded() {
    if (this.isEndedHandled) return;
    this.isEndedHandled = true;

    console.log(`[AudioEngine] Track finished: ${this.currentTrackId}. RepeatMode: ${this.repeatMode}`);
    if (this.currentTrackId && this.currentTime > 5) {
      apiRecordHistory({ id: this.currentTrackId, title: '', artist: '' } as any, Math.round(this.currentTime * 1000));
    }

    if (this.repeatMode === 'one' && this.audio) {
      this.isEndedHandled = false;
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
      return;
    }

    if (this.onTrackEndCallback) {
      this.onTrackEndCallback();
    } else if (this.mediaCallbacks.onNext) {
      this.mediaCallbacks.onNext();
    } else {
      this.isPlaying = false;
      this.syncPlaybackState('paused');
      this.notify();
    }
  }

  private setMediaActionHandler(action: MediaSessionAction, handler: MediaSessionActionHandler | null) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Ignore unsupported action types on certain platforms
    }
  }

  public syncPlaybackState(forcedState?: 'playing' | 'paused' | 'none') {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const state = forcedState || (this.isPlaying ? 'playing' : 'paused');
      navigator.mediaSession.playbackState = state;
    } catch (e) {
      console.warn('[AudioEngine] syncPlaybackState error:', e);
    }
  }

  public updatePositionState(force = false) {
    if (
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator) ||
      !('setPositionState' in navigator.mediaSession)
    ) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastPositionSyncTime < 1000) return;
    this.lastPositionSyncTime = now;

    try {
      const duration = this.duration && !Number.isNaN(this.duration) && this.duration > 0 ? this.duration : 0;
      const position = this.currentTime && !Number.isNaN(this.currentTime) && this.currentTime >= 0
        ? Math.min(this.currentTime, duration)
        : 0;
      const playbackRate = this.audio?.playbackRate || 1;

      if (duration > 0) {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate,
          position,
        });
      }
    } catch {
      // Ignored if position state cannot be applied during track transitions
    }
  }

  public updateMediaSession(
    track: { title: string; artist: string; album?: string; coverUrl?: string },
    callbacks?: {
      onNext?: () => void;
      onPrev?: () => void;
      onTogglePlay?: () => void;
      onSeek?: (secs: number) => void;
    }
  ) {
    this.currentMediaTrack = track;
    if (callbacks) {
      this.mediaCallbacks = { ...this.mediaCallbacks, ...callbacks };
    }

    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      let fullCoverUrl = track.coverUrl || '';
      if (
        fullCoverUrl &&
        typeof window !== 'undefined' &&
        !fullCoverUrl.startsWith('http') &&
        !fullCoverUrl.startsWith('data:')
      ) {
        try {
          fullCoverUrl = new URL(fullCoverUrl, window.location.origin).href;
        } catch {}
      }

      const artwork = fullCoverUrl
        ? [
            { src: fullCoverUrl, sizes: '96x96' },
            { src: fullCoverUrl, sizes: '128x128' },
            { src: fullCoverUrl, sizes: '192x192' },
            { src: fullCoverUrl, sizes: '256x256' },
            { src: fullCoverUrl, sizes: '384x384' },
            { src: fullCoverUrl, sizes: '512x512' },
          ]
        : undefined;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'EVA AI Music',
        artwork,
      });

      this.syncPlaybackState();
      this.updatePositionState(true);

      // Register complete suite of action handlers for Android Quick Settings & Bluetooth AVRCP
      this.setMediaActionHandler('play', () => {
        console.log('[AudioEngine] MediaSession play event received');
        if (this.mediaCallbacks.onTogglePlay) {
          this.mediaCallbacks.onTogglePlay();
        } else {
          this.play();
        }
      });

      this.setMediaActionHandler('pause', () => {
        console.log('[AudioEngine] MediaSession pause event received');
        if (this.mediaCallbacks.onTogglePlay) {
          this.mediaCallbacks.onTogglePlay();
        } else {
          this.pause();
        }
      });

      this.setMediaActionHandler('nexttrack', () => {
        console.log('[AudioEngine] MediaSession nexttrack event received (Bluetooth / Android Notification)');
        if (this.mediaCallbacks.onNext) {
          this.mediaCallbacks.onNext();
        }
      });

      this.setMediaActionHandler('previoustrack', () => {
        console.log('[AudioEngine] MediaSession previoustrack event received (Bluetooth / Android Notification)');
        if (this.mediaCallbacks.onPrev) {
          this.mediaCallbacks.onPrev();
        }
      });

      this.setMediaActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && !Number.isNaN(details.seekTime)) {
          if (this.mediaCallbacks.onSeek) {
            this.mediaCallbacks.onSeek(details.seekTime);
          } else {
            this.seek(details.seekTime);
          }
        }
      });

      this.setMediaActionHandler('seekbackward', (details) => {
        const skipSecs = details.seekOffset || 10;
        this.seek(Math.max(0, this.currentTime - skipSecs));
      });

      this.setMediaActionHandler('seekforward', (details) => {
        const skipSecs = details.seekOffset || 10;
        this.seek(Math.min(this.duration, this.currentTime + skipSecs));
      });

      this.setMediaActionHandler('stop', () => {
        this.pause();
        this.seek(0);
        this.syncPlaybackState('none');
      });
    } catch (e) {
      console.warn('[AudioEngine] MediaSession error:', e);
    }
  }

  public getState() {
    return {
      currentTrackId: this.currentTrackId,
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      hasPlaybackError: this.hasPlaybackError,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      isShuffle: this.isShuffle,
      repeatMode: this.repeatMode,
      equalizerPreset: this.equalizerPreset,
    };
  }
}

export const audioEngine = new AudioEngine();
