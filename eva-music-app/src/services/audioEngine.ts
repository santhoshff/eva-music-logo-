/**
 * EVA AI Music - Native High-Fidelity Audio Engine
 * Plays authentic song streams directly via HTML5 Audio with instant buffering,
 * MediaSession lock screen integration, and zero random BGM fallbacks.
 */

import { apiRecordHistory } from './backendApi';

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

  private isEndedHandled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;
    this.audio.muted = this.isMuted;

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.isLoading = false;
      this.hasPlaybackError = false;
      this.notify();
    });

    this.audio.addEventListener('playing', () => {
      this.isPlaying = true;
      this.isLoading = false;
      this.hasPlaybackError = false;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
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
      }
      this.notify();
    });

    this.audio.addEventListener('durationchange', () => {
      if (this.audio && this.audio.duration && !Number.isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.duration = this.audio.duration;
        this.notify();
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && !Number.isNaN(this.audio.currentTime)) {
        this.currentTime = this.audio.currentTime;
        this.notify();
      }
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn(`[AudioEngine] Audio error for track ${this.currentTrackId}:`, this.audio?.error || e);
      
      // If direct CDN stream failed (e.g. timeout, CDN restriction), fail over to serverless stream proxy
      if (this.rawAudioUrl && this.rawAudioUrl.includes('saavncdn.com') && !this.rawAudioUrl.includes('/api/stream')) {
        const proxyUrl = `/api/stream?url=${encodeURIComponent(this.rawAudioUrl)}`;
        console.log(`[AudioEngine] Direct CDN stream error. Switching to serverless stream proxy:`, proxyUrl);
        if (this.audio && !this.audio.src.includes('/api/stream')) {
          this.audio.src = proxyUrl;
          this.audio.play().catch(err => console.warn('[AudioEngine] Proxy playback failed:', err.message));
          return;
        }
      }

      // Attempt secondary fallback stream before concluding failure
      if (this.currentFallbackUrl && this.audio && this.audio.src !== this.currentFallbackUrl) {
        const fallback = this.currentFallbackUrl;
        this.currentFallbackUrl = null; // Prevent secondary fallback loop
        console.log(`[AudioEngine] Attempting fallback stream for ${this.currentTrackId}:`, fallback);
        this.audio.src = fallback;
        this.audio.play().catch(err => console.warn('[AudioEngine] Fallback play failed:', err.message));
        return;
      }

      this.isLoading = false;
      this.isPlaying = false;
      this.hasPlaybackError = true;
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
      const query = (trackTitle || trackId).replace(/\(From.*?\)/gi, '').trim();
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
          if (requestId !== this.currentRequestId || !this.audio) return;
          const fullMatch = data.results?.find((r: any) => r.audioUrl && r.audioUrl.includes('saavncdn.com'));
          if (fullMatch && fullMatch.audioUrl) {
            console.log(`[AudioEngine] Resolved full-length 320kbps track for ${trackId}:`, fullMatch.audioUrl);
            this.playDirectStream(fullMatch.audioUrl, fullMatch.durationSeconds || 240, requestId, trackId);
          } else if (streamUrl) {
            this.playDirectStream(streamUrl, durationSeconds, requestId, trackId);
          }
        })
        .catch(() => {
          if (streamUrl) {
            this.playDirectStream(streamUrl, durationSeconds, requestId, trackId);
          }
        });
      return;
    }

    this.playDirectStream(streamUrl, durationSeconds, requestId, trackId);
  }

  private playDirectStream(streamUrl: string, durationSecs: number, requestId: number, trackId: string) {
    if (!this.audio || requestId !== this.currentRequestId) return;
    this.rawAudioUrl = streamUrl;
    this.duration = durationSecs > 0 ? durationSecs : 218;

    console.log(`[AudioEngine] Playing authentic track #${requestId} [${trackId}]: ${streamUrl}`);

    try {
      if (this.audio.src !== streamUrl) {
        this.audio.src = streamUrl;
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
                      this.notify();
                    }).catch(() => {});
                  }
                };
                this.audio?.addEventListener('canplay', onCanPlay, { once: true });
                return;
              }

              console.warn(`[AudioEngine] Autoplay prevented:`, err.message);
              const resumeOnTouch = () => {
                if (this.audio && this.currentTrackId === trackId) {
                  this.audio.play().then(() => {
                    this.isPlaying = true;
                    this.isLoading = false;
                    this.notify();
                  }).catch(() => {});
                }
                window.removeEventListener('click', resumeOnTouch);
                window.removeEventListener('touchstart', resumeOnTouch);
              };
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
    if (streamUrl.startsWith('/api/')) {
      const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      streamUrl = `${backendBase.replace(/\/api\/?$/, '')}${streamUrl}`;
    }
    this.rawAudioUrl = streamUrl;
    this.initAudioElement();
    if (this.audio && streamUrl) {
      this.audio.src = streamUrl;
      this.audio.currentTime = 0;
    }
    this.notify();
  }

  public togglePlay() {
    this.initAudioElement();
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      if (!this.audio.src && this.currentTrackId) {
        this.playTrack(this.currentTrackId, this.rawAudioUrl, this.duration);
      } else {
        this.audio.play().catch(e => console.warn('[AudioEngine] Toggle play error:', e));
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
    } else {
      this.isPlaying = false;
      this.notify();
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
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'EVA AI Music',
        artwork: track.coverUrl
          ? [
              { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
              { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
              { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
            ]
          : undefined,
      });

      if (callbacks?.onTogglePlay) {
        navigator.mediaSession.setActionHandler('play', () => callbacks.onTogglePlay!());
        navigator.mediaSession.setActionHandler('pause', () => callbacks.onTogglePlay!());
      }
      if (callbacks?.onNext) {
        navigator.mediaSession.setActionHandler('nexttrack', () => callbacks.onNext!());
      }
      if (callbacks?.onPrev) {
        navigator.mediaSession.setActionHandler('previoustrack', () => callbacks.onPrev!());
      }
      if (callbacks?.onSeek) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) callbacks.onSeek!(details.seekTime);
        });
      }
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
