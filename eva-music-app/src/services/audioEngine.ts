import { Howl, Howler } from 'howler';
import { getBackendStreamUrl, apiRecordHistory } from './backendApi';

type Listener = () => void;

class AudioEngine {
  private howl: Howl | null = null;
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
  private rawAudioUrl: string = '';
  private _currentRequestId = 0;
  private timer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      Howler.volume(this.volume);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (this.howl && this.isPlaying) {
        const seekVal = this.howl.seek() as number;
        if (typeof seekVal === 'number' && !Number.isNaN(seekVal)) {
          this.currentTime = seekVal;
          this.notify();
        }
      }
    }, 250);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public loadTrack(trackId: string, audioUrl?: string, durationSeconds: number = 218, fallbackAudioUrl?: string) {
    const requestId = ++this._currentRequestId;
    this.currentTrackId = trackId;
    this.currentTime = 0;
    this.duration = durationSeconds;

    // Unload previous Howl instance to prevent leftover audio or race conditions
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }

    // Ensure full song stream is prioritized (filter out 30s iTunes preview links)
    const is30sPreview = (url?: string) => !url || url.includes('AudioPreview') || url.includes('itunes.apple.com') || url.includes('/preview');
    const streamUrl = audioUrl && audioUrl.startsWith('http') && !is30sPreview(audioUrl) ? audioUrl : getBackendStreamUrl(trackId);
    this.rawAudioUrl = streamUrl;

    this.howl = new Howl({
      src: [streamUrl],
      html5: true, // HTML5 Audio streaming
      format: ['mp3', 'm4a', 'aac'],
      volume: this.isMuted ? 0 : this.volume,
      onload: () => {
        if (requestId !== this._currentRequestId) return;
        const dur = this.howl?.duration();
        if (dur && dur > 0) {
          this.duration = dur;
        }
        this.isLoading = false;
        this.notify();
      },
      onplay: () => {
        if (requestId !== this._currentRequestId) return;
        this.isPlaying = true;
        this.isLoading = false;
        this.startTimer();
        this.notify();
      },
      onpause: () => {
        if (requestId !== this._currentRequestId) return;
        this.isPlaying = false;
        this.stopTimer();
        this.notify();
      },
      onstop: () => {
        if (requestId !== this._currentRequestId) return;
        this.isPlaying = false;
        this.stopTimer();
        this.notify();
      },
      onend: () => {
        if (requestId !== this._currentRequestId) return;
        this.handleTrackEnded();
      },
      onloaderror: (_id, err) => {
        if (requestId !== this._currentRequestId) return;
        console.error(`[AudioEngine] Howl load error for track ${trackId}:`, err);
        this.isLoading = false;
        this.isPlaying = false;
        this.notify();
      },
      onplayerror: (_id, err) => {
        if (requestId !== this._currentRequestId) return;
        console.error(`[AudioEngine] Howl play error for track ${trackId}:`, err);
        this.isLoading = false;
        this.isPlaying = false;
        this.notify();
      }
    });

    this.notify();
  }

  public playTrack(trackId: string, audioUrl?: string, durationSeconds: number = 218, fallbackAudioUrl?: string) {
    const requestId = ++this._currentRequestId;
    console.log(`[AudioEngine] Howler playTrack request #${requestId} for trackId=${trackId}`);

    this.currentTrackId = trackId;
    this.currentTime = 0;
    this.duration = durationSeconds;
    this.isLoading = true;
    this.notify();

    // Explicitly unload previous Howl instance
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }

    // Ensure full song stream is prioritized (filter out 30s iTunes preview links)
    const is30sPreview = (url?: string) => !url || url.includes('AudioPreview') || url.includes('itunes.apple.com') || url.includes('/preview');
    const streamUrl = audioUrl && audioUrl.startsWith('http') && !is30sPreview(audioUrl) ? audioUrl : getBackendStreamUrl(trackId);
    this.rawAudioUrl = streamUrl;

    // Create fresh Howl instance for new track
    this.howl = new Howl({
      src: [streamUrl],
      html5: true,
      format: ['mp3', 'm4a', 'aac'],
      volume: this.isMuted ? 0 : this.volume,
      onload: () => {
        if (requestId !== this._currentRequestId) return;
        const dur = this.howl?.duration();
        if (dur && dur > 0) {
          this.duration = dur;
        }
        this.isLoading = false;
        this.notify();
      },
      onplay: () => {
        if (requestId !== this._currentRequestId) return;
        this.isPlaying = true;
        this.isLoading = false;
        this.startTimer();
        console.log(`[AudioEngine] Howl now playing trackId=${trackId} (request #${requestId})`);
        this.notify();
      },
      onpause: () => {
        if (requestId !== this._currentRequestId) return;
        this.isPlaying = false;
        this.stopTimer();
        this.notify();
      },
      onstop: () => {
        if (requestId !== this._currentRequestId) return;
        this.isPlaying = false;
        this.stopTimer();
        this.notify();
      },
      onend: () => {
        if (requestId !== this._currentRequestId) return;
        this.handleTrackEnded();
      },
      onloaderror: (_id, err) => {
        if (requestId !== this._currentRequestId) return;
        console.error(`[AudioEngine] Howl load error (request #${requestId}):`, err);
        this.isLoading = false;
        this.isPlaying = false;
        this.notify();
      },
      onplayerror: (_id, err) => {
        if (requestId !== this._currentRequestId) return;
        console.error(`[AudioEngine] Howl play error (request #${requestId}):`, err);
        this.isLoading = false;
        this.isPlaying = false;
        this.notify();
      }
    });

    // Call Howl.play() directly
    this.howl.play();
  }

  public togglePlay() {
    if (!this.howl || !this.currentTrackId) {
      if (this.currentTrackId) {
        this.playTrack(this.currentTrackId);
      }
      return;
    }

    if (this.isPlaying) {
      this.howl.pause();
    } else {
      this.howl.play();
    }
  }

  public seek(seconds: number) {
    if (this.howl) {
      this.howl.seek(seconds);
      this.currentTime = seconds;
      this.notify();
    }
  }

  public setVolume(vol: number) {
    this.volume = vol;
    if (this.howl) {
      this.howl.volume(this.isMuted ? 0 : vol);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.howl) {
      this.howl.volume(this.isMuted ? 0 : this.volume);
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
    this.isPlaying = false;
    this.stopTimer();
    if (this.currentTrackId && this.currentTime > 5) {
      apiRecordHistory({ id: this.currentTrackId, title: '', artist: '' } as any, Math.round(this.currentTime * 1000));
    }
    this.notify();
  }

  public getState() {
    return {
      currentTrackId: this.currentTrackId,
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
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
