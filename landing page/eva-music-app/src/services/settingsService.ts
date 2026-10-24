/**
 * EVA Music - Comprehensive Settings Management Service
 * Inspired by Echo / MetroList advanced settings architecture.
 */

export interface EvaSettings {
  // AI & Translation
  aiProvider: 'OpenAI' | 'Gemini' | 'OpenRouter' | 'Claude' | 'Groq' | 'Mistral' | 'Ollama';
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  translateLanguage: string;
  translateMode: 'Literal' | 'Poetic' | 'Romanized';
  autoTranslateLyrics: boolean;
  aiRecommendations: boolean;
  createFromTasteDaily: boolean;

  // Player & Audio
  audioQualityWifi: 'Lossless FLAC' | 'High (320kbps)' | 'Normal (160kbps)' | 'Data Saver (96kbps)';
  audioQualityCellular: 'High (320kbps)' | 'Normal (160kbps)' | 'Data Saver (96kbps)';
  equalizer: 'normal' | 'bass' | 'vocal' | 'lofi' | 'acoustic' | 'electronic';
  audioNormalization: boolean;
  crossfadeEnabled: boolean;
  crossfadeDuration: number; // 0 - 12 seconds
  gaplessPlayback: boolean;
  skipSilence: boolean;
  preloadNextSong: boolean;
  autoSkipOnError: boolean;
  stopMusicOnTaskClear: boolean;
  sleepTimerMinutes: number | null; // null or minutes

  // Appearance & UI (Expanded from AppearanceSettings.kt)
  themeMode: 'dark' | 'light' | 'system' | 'oled';
  accentColor: 'purple' | 'cyan' | 'emerald' | 'rose' | 'amber';
  dynamicTheme: boolean; // Dynamic Material You color extracted from album art
  glassEffect: 'soft' | 'medium' | 'ultra' | 'off';
  smoothAnimations: boolean;
  appIcon: 'default' | 'retro' | 'minimal' | 'neon' | 'vinyl' | 'gold';
  appFont: 'system' | 'google-sans' | 'sans-flex' | 'outfit' | 'plus-jakarta';
  enableHighRefreshRate: boolean;
  liveBlurDensity: number; // 10 to 100

  // Player Visual Customization (from AppearanceSettings.kt)
  useNewPlayerDesign: boolean; // Apple Music inspired vs modern player
  hidePlayerSlider: boolean; // hide volume slider
  playerBackgroundStyle: 'default' | 'gradient' | 'blur' | 'apple_music' | 'live_mesh' | 'liquid_glass' | 'glow_animated' | 'dynamic-gradient' | 'album-blur' | 'solid-dark';
  miniPlayerBackgroundStyle: 'default' | 'gradient' | 'blur' | 'live_mesh' | 'liquid_glass' | 'glow_animated';
  hidePlayerThumbnail: boolean;
  cropAlbumArt: boolean;
  thumbnailCornerRadius: number; // 0 to 36dp
  playerButtonsStyle: 'default' | 'primary' | 'tertiary';
  sliderStyle: 'slim' | 'wavy' | 'squiggly' | 'bar';
  wavyPlayPause: boolean;
  swipeThumbnail: boolean;
  swipeSensitivity: number; // 0.1 to 1.0 (default 0.73)
  canvasThumbnailAnimation: boolean;
  rotatingThumbnail: boolean;
  showCommentButton: boolean;
  showCodecOnPlayer: boolean;

  // Lyrics Appearance (from AppearanceSettings.kt)
  lyricsPosition: 'left' | 'center' | 'right';
  lyricsAnimationStyle: 'apple_v2' | 'apple' | 'fluid' | 'karaoke' | 'glow' | 'slide' | 'fade' | 'metro' | 'none';
  appleMusicLyricsBlur: boolean;
  lyricsStandardBlur: boolean;
  lyricsTextSize: number; // 16 to 36 sp
  lyricsLineSpacing: number; // 1.0 to 4.0 x
  lyricsClick: boolean;
  lyricsScroll: boolean;
  swipeLyrics: boolean;
  enableLyricsThumbnailPlayPause: boolean;
  hideStatusBarOnFullscreen: boolean;

  // Navigation, Misc & Gestures (from AppearanceSettings.kt)
  defaultOpenTab: 'home' | 'discover' | 'library';
  defaultLibChip: 'all' | 'songs' | 'artists' | 'albums' | 'playlists' | 'local';
  swipeSongToAdd: boolean;
  swipeSongToRemove: boolean;
  listenTogetherInTopBar: boolean;
  gridItemSize: 'small' | 'big';
  densityScale: number; // 0.85, 1.0, 1.15

  // Auto Playlists (from AppearanceSettings.kt)
  showLikedPlaylist: boolean;
  showDownloadedPlaylist: boolean;
  showExportedPlaylist: boolean;
  showTopPlaylist: boolean;
  showBottomPlaylist: boolean;
  showCachedPlaylist: boolean;

  // Feedback & Haptics (from AppearanceSettings.kt)
  enableHaptics: boolean;
  hapticIntensity: 'light' | 'medium' | 'heavy';
  enableClickHaptics: boolean;
  enableSliderHaptics: boolean;
  enableScrollEdgeHaptics: boolean;
  enableLongPressHaptics: boolean;

  // Content & Languages
  filterExplicit: boolean;
  preferredLanguages: string[];
  blockedArtists: string[];

  // Social & Integrations
  discordRichPresence: boolean;
  lastFmScrobbling: boolean;
  lastFmUsername: string;
  listenTogetherUsername: string;
  listenTogetherAutoSync: boolean;
  listenTogetherServerUrl: string;
  spotifySync: boolean;
  ytmSync: boolean;
}

export const DEFAULT_SETTINGS: EvaSettings = {
  aiProvider: 'Gemini',
  aiApiKey: '',
  aiModel: 'gemini-1.5-flash',
  aiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  translateLanguage: 'en',
  translateMode: 'Poetic',
  autoTranslateLyrics: false,
  aiRecommendations: true,
  createFromTasteDaily: true,

  audioQualityWifi: 'Lossless FLAC',
  audioQualityCellular: 'High (320kbps)',
  equalizer: 'bass',
  audioNormalization: true,
  crossfadeEnabled: true,
  crossfadeDuration: 4,
  gaplessPlayback: true,
  skipSilence: false,
  preloadNextSong: true,
  autoSkipOnError: true,
  stopMusicOnTaskClear: false,
  sleepTimerMinutes: null,

  // Appearance defaults
  themeMode: 'dark',
  accentColor: 'purple',
  dynamicTheme: true,
  glassEffect: 'medium',
  smoothAnimations: true,
  appIcon: 'default',
  appFont: 'system',
  enableHighRefreshRate: true,
  liveBlurDensity: 50,

  useNewPlayerDesign: true,
  hidePlayerSlider: false,
  playerBackgroundStyle: 'gradient',
  miniPlayerBackgroundStyle: 'default',
  hidePlayerThumbnail: false,
  cropAlbumArt: false,
  thumbnailCornerRadius: 16,
  playerButtonsStyle: 'default',
  sliderStyle: 'slim',
  wavyPlayPause: true,
  swipeThumbnail: true,
  swipeSensitivity: 0.73,
  canvasThumbnailAnimation: true,
  rotatingThumbnail: false,
  showCommentButton: false,
  showCodecOnPlayer: true,

  lyricsPosition: 'left',
  lyricsAnimationStyle: 'apple_v2',
  appleMusicLyricsBlur: true,
  lyricsStandardBlur: false,
  lyricsTextSize: 24,
  lyricsLineSpacing: 1.3,
  lyricsClick: true,
  lyricsScroll: true,
  swipeLyrics: false,
  enableLyricsThumbnailPlayPause: false,
  hideStatusBarOnFullscreen: false,

  defaultOpenTab: 'home',
  defaultLibChip: 'all',
  swipeSongToAdd: true,
  swipeSongToRemove: false,
  listenTogetherInTopBar: true,
  gridItemSize: 'small',
  densityScale: 1.0,

  showLikedPlaylist: true,
  showDownloadedPlaylist: true,
  showExportedPlaylist: true,
  showTopPlaylist: true,
  showBottomPlaylist: true,
  showCachedPlaylist: true,

  enableHaptics: true,
  hapticIntensity: 'medium',
  enableClickHaptics: true,
  enableSliderHaptics: true,
  enableScrollEdgeHaptics: true,
  enableLongPressHaptics: false,

  filterExplicit: false,
  preferredLanguages: ['English', 'Spanish', 'Hindi', 'Japanese', 'Korean'],
  blockedArtists: [],

  discordRichPresence: true,
  lastFmScrobbling: false,
  lastFmUsername: '',
  listenTogetherUsername: 'EVA Listener',
  listenTogetherAutoSync: true,
  listenTogetherServerUrl: 'http://localhost:8080',
  spotifySync: false,
  ytmSync: true,
};

const STORAGE_KEY = 'eva_music_user_settings_v2';
type SettingsListener = (settings: EvaSettings) => void;

class SettingsService {
  private settings: EvaSettings;
  private listeners: Set<SettingsListener> = new Set();
  private sleepTimerHandle: any = null;

  constructor() {
    this.settings = this.loadSettings();
    this.applyAesthetics();
  }

  private loadSettings(): EvaSettings {
    if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('[SettingsService] Failed to load settings from localStorage', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public getSettings(): EvaSettings {
    return { ...this.settings };
  }

  public get<K extends keyof EvaSettings>(key: K): EvaSettings[K] {
    return this.settings[key];
  }

  public update<K extends keyof EvaSettings>(key: K, value: EvaSettings[K]): void {
    this.settings[key] = value;
    this.saveSettings();
    this.applyAesthetics();
    this.notify();
  }

  public updateMultiple(partial: Partial<EvaSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    this.applyAesthetics();
    this.notify();
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[SettingsService] Failed to save settings to localStorage', e);
    }
  }

  public subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const current = this.getSettings();
    this.listeners.forEach(fn => {
      try {
        fn(current);
      } catch (err) {
        console.error('[SettingsService] Listener error:', err);
      }
    });
  }

  public applyAesthetics(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Apply OLED pitch black or standard dark/light
    if (this.settings.themeMode === 'oled') {
      root.classList.add('dark', 'oled');
    } else {
      root.classList.remove('oled');
      if (this.settings.themeMode === 'dark') {
        root.classList.add('dark');
      } else if (this.settings.themeMode === 'light') {
        root.classList.remove('dark');
      }
    }

    // Apply Accent color data attribute
    root.setAttribute('data-accent', this.settings.accentColor);
    root.setAttribute('data-glass', this.settings.glassEffect);
    root.setAttribute('data-font', this.settings.appFont);
    root.style.setProperty('--app-density', String(this.settings.densityScale));
  }

  public triggerHaptic(type: 'click' | 'slider' | 'edge' | 'long' | 'light' | 'medium' | 'heavy' = 'click'): void {
    if (typeof window === 'undefined' || !this.settings.enableHaptics) return;
    if (!navigator.vibrate) return;
    
    if (type === 'click' && !this.settings.enableClickHaptics) return;
    if (type === 'slider' && !this.settings.enableSliderHaptics) return;
    if (type === 'edge' && !this.settings.enableScrollEdgeHaptics) return;
    if (type === 'long' && !this.settings.enableLongPressHaptics) return;

    const intensityMap = {
      light: [8],
      medium: [18],
      heavy: [35],
    };
    const pattern = (type === 'light' || type === 'medium' || type === 'heavy')
      ? intensityMap[type]
      : (intensityMap[this.settings.hapticIntensity] || [18]);
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if vibration unavailable
    }
  }

  public setSleepTimer(minutes: number | null, onTrigger?: () => void): void {
    if (this.sleepTimerHandle) {
      clearTimeout(this.sleepTimerHandle);
      this.sleepTimerHandle = null;
    }

    this.update('sleepTimerMinutes', minutes);

    if (minutes && minutes > 0) {
      this.sleepTimerHandle = setTimeout(() => {
        this.update('sleepTimerMinutes', null);
        if (onTrigger) onTrigger();
      }, minutes * 60 * 1000);
    }
  }

  /** Export all settings and local cache to a downloadable JSON file */
  public exportBackup(): string {
    const backupData = {
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      settings: this.settings,
      favorites: typeof window !== 'undefined' ? localStorage.getItem('eva_favorites') : null,
      customPlaylists: typeof window !== 'undefined' ? localStorage.getItem('eva_custom_playlists') : null,
      history: typeof window !== 'undefined' ? localStorage.getItem('eva_play_history') : null,
    };
    return JSON.stringify(backupData, null, 2);
  }

  /** Import and restore settings from a backup object */
  public importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
        this.saveSettings();
        this.applyAesthetics();
      }
      if (typeof window !== 'undefined') {
        if (data.favorites) localStorage.setItem('eva_favorites', data.favorites);
        if (data.customPlaylists) localStorage.setItem('eva_custom_playlists', data.customPlaylists);
        if (data.history) localStorage.setItem('eva_play_history', data.history);
      }
      this.notify();
      return true;
    } catch (e) {
      console.error('[SettingsService] Failed to import backup:', e);
      return false;
    }
  }

  public addBlockedArtist(name: string): void {
    const trimmed = name.trim();
    if (!trimmed || this.settings.blockedArtists.includes(trimmed)) return;
    this.update('blockedArtists', [...this.settings.blockedArtists, trimmed]);
  }

  public removeBlockedArtist(name: string): void {
    this.update(
      'blockedArtists',
      this.settings.blockedArtists.filter(a => a.toLowerCase() !== name.toLowerCase())
    );
  }

  public isArtistBlocked(name: string): boolean {
    if (!name) return false;
    const lower = name.toLowerCase();
    return this.settings.blockedArtists.some(a => a.toLowerCase() === lower);
  }

  /** Clear offline music cache */
  public async clearMusicCache(): Promise<number> {
    let clearedCount = 0;
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.startsWith('eva_stream_cache_') || k.startsWith('eva_lyrics_cache_')) {
            localStorage.removeItem(k);
            clearedCount++;
          }
        }
      } catch (e) {
        console.warn('Error clearing localStorage audio cache', e);
      }
    }
    return clearedCount;
  }
}

export const settingsService = new SettingsService();
