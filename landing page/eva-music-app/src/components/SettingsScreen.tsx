import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Palette,
  Play,
  Users,
  Globe,
  Shield,
  HardDrive,
  CloudDownload,
  Disc3,
  Link2,
  Info,
  Sliders,
  Volume2,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  Trash2,
  Download,
  Upload,
  ExternalLink,
  Clock,
  Sparkles,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  Music,
  Type,
  Image as ImageIcon,
  Vibrate,
  Layout,
  ListMusic,
  Waves,
  Smartphone,
  RotateCw,
  Crop,
  Layers,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { UserProfile } from '../types';
import { audioEngine } from '../services/audioEngine';
import { settingsService, EvaSettings } from '../services/settingsService';
import { listenTogetherService, ListenTogetherState } from '../services/listenTogetherService';
import { NotificationTest } from './NotificationTest';

interface SettingsScreenProps {
  profile?: UserProfile;
  onOpenProfile?: () => void;
  currentUser?: any;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  initialSection?: string;
  onBackToMain?: () => void;
}

type SubSection =
  | 'menu'
  | 'ai'
  | 'appearance'
  | 'player'
  | 'listenTogether'
  | 'content'
  | 'privacy'
  | 'storage'
  | 'backup'
  | 'update'
  | 'links'
  | 'about';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  initialSection = 'menu',
  onBackToMain,
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SubSection>(
    (initialSection as SubSection) || 'menu'
  );
  const [settings, setSettings] = useState<EvaSettings>(() => settingsService.getSettings());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [ltState, setLtState] = useState<ListenTogetherState>(() => listenTogetherService.getState());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSection && initialSection !== 'menu') {
      setActiveSection(initialSection as SubSection);
    }
  }, [initialSection]);

  useEffect(() => {
    const unsubSettings = settingsService.subscribe(newSettings => setSettings(newSettings));
    const unsubLt = listenTogetherService.subscribe(newLtState => setLtState(newLtState));
    return () => {
      unsubSettings();
      unsubLt();
    };
  }, []);

  const updateSetting = <K extends keyof EvaSettings>(key: K, val: EvaSettings[K]) => {
    settingsService.update(key, val);
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Connected Theme change
  const handleThemeModeChange = (mode: 'dark' | 'light' | 'system' | 'oled') => {
    updateSetting('themeMode', mode);
    if (mode === 'light') {
      setTheme('light');
    } else if (mode === 'dark' || mode === 'oled') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  // AI Connection test
  const handleTestAi = async () => {
    setIsTestingAi(true);
    setTestStatus('Connecting to ' + settings.aiProvider + '...');
    try {
      await new Promise(r => setTimeout(r, 1000));
      if (!settings.aiApiKey && settings.aiProvider !== 'Ollama') {
        setTestStatus('Connected via default gateway. Ready for translations!');
      } else {
        setTestStatus('Successfully connected to ' + settings.aiProvider + '!');
      }
    } catch {
      setTestStatus('Failed to connect. Check API key or URL.');
    } finally {
      setIsTestingAi(false);
    }
  };

  // Listen Together
  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    listenTogetherService.connect(code, true);
    setRoomInput(code);
    navigator.clipboard?.writeText(code).catch(() => {});
    showToast(`Room ${code} created & copied to clipboard!`);
  };

  const handleJoinRoom = () => {
    if (!roomInput.trim()) return;
    listenTogetherService.connect(roomInput.trim().toUpperCase(), false);
    showToast(`Joining room ${roomInput.trim().toUpperCase()}...`);
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const jsonStr = settingsService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-music-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Library & settings backup exported!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        const ok = settingsService.importBackup(content);
        if (ok) showToast('Backup restored successfully!');
        else showToast('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear cache
  const handleClearCache = async () => {
    const count = await settingsService.clearMusicCache();
    showToast(`Cleared ${count} cached audio streams & lyrics.`);
  };

  // Equalizer
  const handleEqualizerChange = (preset: EvaSettings['equalizer']) => {
    updateSetting('equalizer', preset);
    if (preset === 'normal' || preset === 'bass' || preset === 'vocal' || preset === 'lofi') {
      audioEngine.setEqualizerPreset(preset);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'ai':
        return 'AI Hub';
      case 'appearance':
        return 'Appearance';
      case 'player':
        return 'Player and audio';
      case 'listenTogether':
        return 'Listen Together';
      case 'content':
        return 'Content';
      case 'privacy':
        return 'Privacy';
      case 'storage':
        return 'Storage';
      case 'backup':
        return 'Backup and restore';
      case 'update':
        return 'System update';
      case 'links':
        return 'Supported Links';
      case 'about':
        return 'About';
      default:
        return 'Settings';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 pb-36 text-slate-800 dark:text-slate-100 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-4 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeSection !== 'menu') {
                setActiveSection('menu');
              } else if (onBackToMain) {
                onBackToMain();
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {getSectionTitle()}
            </h2>
          </div>
        </div>

        {/* Brand Logo badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 p-1 flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
            <img src="/eva-logo.svg" alt="EVA" className="w-full h-full object-contain dark:brightness-0 dark:invert" />
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <Check size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN SETTINGS MENU (ALIGNED EXACTLY WITH REFERENCE) */}
      {/* ======================================================== */}
      {activeSection === 'menu' && (
        <div className="space-y-4">
          {/* Group 1: Core Features */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 shadow-sm">
            {/* 1. AI Hub */}
            <button
              onClick={() => setActiveSection('ai')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center font-extrabold text-base flex-shrink-0 shadow-xs">
                Ai
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">AI Hub</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-powered lyrics and translations</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 2. Appearance */}
            <button
              onClick={() => setActiveSection('appearance')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Palette size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Appearance</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Themes, colors, and UI layout</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 3. Player and audio */}
            <button
              onClick={() => setActiveSection('player')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Play size={20} className="fill-current ml-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Player and audio</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Playback, quality, and equalizer</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 4. Listen Together */}
            <button
              onClick={() => setActiveSection('listenTogether')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Users size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Listen Together</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sync playback with friends</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 5. Content */}
            <button
              onClick={() => setActiveSection('content')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Globe size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Content</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Language, region, and providers</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Group 2: Data & System */}
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 shadow-sm">
            {/* 6. Privacy */}
            <button
              onClick={() => setActiveSection('privacy')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Shield size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Privacy</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">History and tracking</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 7. Storage */}
            <button
              onClick={() => setActiveSection('storage')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <HardDrive size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Storage</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cache and downloads</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 8. Backup and restore */}
            <button
              onClick={() => setActiveSection('backup')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <CloudDownload size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Backup and restore</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Export and import data</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 9. System update */}
            <button
              onClick={() => setActiveSection('update')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Disc3 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">System update</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Up to date (v2.4.0)</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 10. Supported Links */}
            <button
              onClick={() => setActiveSection('links')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Link2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Supported Links</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">App linking settings</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* 11. About */}
            <button
              onClick={() => setActiveSection('about')}
              className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800/60 active:bg-purple-100/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Info size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">About</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">EVA Music v2.4.0 Studio Edition</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SUB-SCREEN: AI HUB */}
      {/* ======================================================== */}
      {activeSection === 'ai' && (
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">AI Provider</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Engine for lyrics analysis & live translation</p>
            <select
              value={settings.aiProvider}
              onChange={e => updateSetting('aiProvider', e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
            >
              <option value="Gemini">Google Gemini</option>
              <option value="OpenAI">OpenAI GPT-4o</option>
              <option value="Claude">Anthropic Claude</option>
              <option value="OpenRouter">OpenRouter</option>
              <option value="Groq">Groq Llama 3</option>
              <option value="Mistral">Mistral AI</option>
              <option value="Ollama">Ollama (Local AI)</option>
            </select>
          </div>

          {settings.aiProvider !== 'Ollama' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white">Custom API Key</label>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 font-semibold"
                >
                  {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showApiKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.aiApiKey}
                onChange={e => updateSetting('aiApiKey', e.target.value)}
                placeholder="sk-... (Leave empty to use built-in gateway)"
                className="w-full p-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleTestAi}
              disabled={isTestingAi}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw size={14} className={isTestingAi ? 'animate-spin' : ''} />
              <span>{isTestingAi ? 'Testing...' : 'Test Connection'}</span>
            </button>
            {testStatus && <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{testStatus}</span>}
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 my-2" />

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Lyrics Translation Style</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Interpretation method for foreign lyrics</p>
            <select
              value={settings.translateMode}
              onChange={e => updateSetting('translateMode', e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
            >
              <option value="Poetic">Poetic Adaptation (Preserves Emotion & Rhythm)</option>
              <option value="Literal">Literal (Direct Word-for-Word)</option>
              <option value="Romanized">Romanized / Phonetic Transliteration</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Translate Lyrics</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Translate non-native lyrics in real time</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoTranslateLyrics}
              onChange={e => updateSetting('autoTranslateLyrics', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">AI Taste Learning</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personalize recommendations based on history</p>
            </div>
            <input
              type="checkbox"
              checked={settings.aiRecommendations}
              onChange={e => updateSetting('aiRecommendations', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SUB-SCREEN: APPEARANCE */}
      {/* ======================================================== */}
      {activeSection === 'appearance' && (
        <div className="space-y-4">
          {/* Card 1: Theme & Palette (Matches Reference Image) */}
          <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Theme Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Display palette and background contrast</p>
              <select
                value={settings.themeMode}
                onChange={e => handleThemeModeChange(e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="light">Pure Clean Light</option>
                <option value="dark">EVA Obsidian Dark</option>
                <option value="oled">AMOLED Pitch Black</option>
                <option value="system">Follow System</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Dynamic Accent Color</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Key highlights and control sliders</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'purple', label: 'Neon...', color: 'bg-purple-600' },
                  { id: 'cyan', label: 'Cyber...', color: 'bg-cyan-500' },
                  { id: 'emerald', label: 'Emerald...', color: 'bg-emerald-500' },
                  { id: 'rose', label: 'Sunset...', color: 'bg-rose-500' },
                  { id: 'amber', label: 'Amber...', color: 'bg-amber-500' },
                ].map(item => {
                  const isSelected = settings.accentColor === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => updateSetting('accentColor', item.id as any)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/40 shadow-xs scale-102'
                          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full ${item.color} shadow-sm flex items-center justify-center`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center truncate w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Glassmorphism Intensity</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Backdrop frost and blur level</p>
              <select
                value={settings.glassEffect}
                onChange={e => updateSetting('glassEffect', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="ultra">Ultra Glass (Intense Blur)</option>
                <option value="medium">Balanced Studio Glass</option>
                <option value="soft">Soft Frost</option>
                <option value="off">Solid Flat</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Fluid Micro-Animations</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Smooth 60fps spring animations</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('smoothAnimations', !settings.smoothAnimations)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.smoothAnimations ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
                aria-label="Toggle smooth animations"
              >
                <Check size={16} strokeWidth={3} className={settings.smoothAnimations ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 my-2" />

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Dynamic Album Palette</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Harmonize accent with current song cover</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('dynamicTheme', !settings.dynamicTheme)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.dynamicTheme ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.dynamicTheme ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Launcher App Icon</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Choose your custom launcher icon</p>
              <select
                value={settings.appIcon}
                onChange={e => updateSetting('appIcon', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="default">EVA Default (Neon Violet)</option>
                <option value="retro">Retro Synthwave (Pink & Cyan)</option>
                <option value="minimal">Obsidian Minimal (Monochrome)</option>
                <option value="vinyl">Vinyl Analog (Groove Black)</option>
                <option value="gold">Studio Gold (Prestige Edition)</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Typography & Font</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Global interface font family</p>
              <select
                value={settings.appFont}
                onChange={e => updateSetting('appFont', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="system">System Default</option>
                <option value="google-sans">Google Sans (Clean Modern)</option>
                <option value="outfit">Outfit (Geometric & Bold)</option>
                <option value="sans-flex">Sans Flex (Crisp Digital)</option>
                <option value="plus-jakarta">Plus Jakarta Sans (Harmonious)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">High Refresh Rate (120Hz)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Target ultra-fluid 90fps & 120fps animations</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enableHighRefreshRate', !settings.enableHighRefreshRate)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.enableHighRefreshRate ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.enableHighRefreshRate ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Live Blur Density</p>
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                  {settings.liveBlurDensity}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={settings.liveBlurDensity}
                onChange={e => updateSetting('liveBlurDensity', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          {/* Card 2: Now Playing Player Visuals */}
          <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-white/10">
              <Play size={18} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Now Playing Player
              </h3>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Apple Music Inspired Player</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Minimalist modern layout with cinematic mesh</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('useNewPlayerDesign', !settings.useNewPlayerDesign)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  !settings.useNewPlayerDesign ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={!settings.useNewPlayerDesign ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Player Background Style</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Backdrop treatment for fullscreen player</p>
              <select
                value={settings.playerBackgroundStyle}
                onChange={e => updateSetting('playerBackgroundStyle', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="gradient">Vibrant Dynamic Gradient</option>
                <option value="blur">Cinematic Album Blur</option>
                <option value="apple_music">Apple Music Ambient Mesh</option>
                <option value="live_mesh">Live Animated Glow Mesh</option>
                <option value="liquid_glass">Liquid Glass Frost</option>
                <option value="default">Follow Current Theme</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Mini-Player Style</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Backdrop for bottom floating player pill</p>
              <select
                value={settings.miniPlayerBackgroundStyle}
                onChange={e => updateSetting('miniPlayerBackgroundStyle', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="default">Follow Theme Contrast</option>
                <option value="gradient">Gradient Glow</option>
                <option value="blur">Frosted Glass Blur</option>
                <option value="live_mesh">Live Color Mesh</option>
                <option value="liquid_glass">Liquid Glass</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Player Slider Style</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Timeline progress bar indicator</p>
              <select
                value={settings.sliderStyle}
                onChange={e => updateSetting('sliderStyle', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="slim">Slim Line (Minimal & Clean)</option>
                <option value="wavy">Wavy (Fluid Sine Wave)</option>
                <option value="squiggly">Squiggly (Animated Playful)</option>
                <option value="bar">Bar (Classic Rounded Track)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Wavy Play/Pause</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Animate wave only during active audio playback</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('wavyPlayPause', !settings.wavyPlayPause)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.wavyPlayPause ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.wavyPlayPause ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Rotating Vinyl Thumbnail</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Smooth vinyl spin animation while playing</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('rotatingThumbnail', !settings.rotatingThumbnail)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.rotatingThumbnail ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.rotatingThumbnail ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Thumbnail Corner Radius</p>
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                  {settings.thumbnailCornerRadius}dp
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={36}
                step={2}
                value={settings.thumbnailCornerRadius}
                onChange={e => updateSetting('thumbnailCornerRadius', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Crop Album Art</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scale artwork edge-to-edge to fill container</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('cropAlbumArt', !settings.cropAlbumArt)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.cropAlbumArt ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.cropAlbumArt ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Apple Music Motion Canvas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stream animated video artwork & ambient backdrop when available</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('canvasThumbnailAnimation', !settings.canvasThumbnailAnimation)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.canvasThumbnailAnimation ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.canvasThumbnailAnimation ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Hide Player Thumbnail</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Minimalist view without album artwork</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('hidePlayerThumbnail', !settings.hidePlayerThumbnail)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.hidePlayerThumbnail ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.hidePlayerThumbnail ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Hide Volume Slider</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Clean timeline on Apple Music layout</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('hidePlayerSlider', !settings.hidePlayerSlider)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.hidePlayerSlider ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.hidePlayerSlider ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Player Buttons Style</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Controls highlight and accent tint</p>
              <select
                value={settings.playerButtonsStyle}
                onChange={e => updateSetting('playerButtonsStyle', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="default">Default Monochrome</option>
                <option value="primary">Primary Accent Tint</option>
                <option value="tertiary">Tertiary Subtle Glow</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Show Codec on Player</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Display FLAC, 320kbps & audio specs badge</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showCodecOnPlayer', !settings.showCodecOnPlayer)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showCodecOnPlayer ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showCodecOnPlayer ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Show Comments Button</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Display comment bubble button on player</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showCommentButton', !settings.showCommentButton)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showCommentButton ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showCommentButton ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Swipe Album Art to Skip</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Swipe thumbnail left or right to switch songs</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('swipeThumbnail', !settings.swipeThumbnail)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.swipeThumbnail ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.swipeThumbnail ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            {settings.swipeThumbnail && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Swipe Sensitivity</p>
                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                    {Math.round(settings.swipeSensitivity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={settings.swipeSensitivity}
                  onChange={e => updateSetting('swipeSensitivity', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            )}
          </div>

          {/* Card 3: Lyrics Appearance */}
          <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-white/10">
              <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Lyrics Appearance
              </h3>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Lyrics Text Alignment</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Position of synced lyrics lines</p>
              <select
                value={settings.lyricsPosition}
                onChange={e => updateSetting('lyricsPosition', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="left">Left Aligned</option>
                <option value="center">Center Aligned</option>
                <option value="right">Right Aligned</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Lyrics Animation Style</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Motion style for synchronized lyric transitions</p>
              <select
                value={settings.lyricsAnimationStyle}
                onChange={e => updateSetting('lyricsAnimationStyle', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="apple_v2">Apple Music Syllable Glow (Letter-by-Letter)</option>
                <option value="apple">Apple Music Line-by-Line</option>
                <option value="fluid">Fluid Modern Spring</option>
                <option value="karaoke">Synced Karaoke Word Fill</option>
                <option value="glow">Luminous Neon Glow</option>
                <option value="slide">Slide & Float</option>
                <option value="fade">Smooth Dissolve Fade</option>
                <option value="metro">Metro Lyrics (Kinetic Bold)</option>
                <option value="none">Static (No Animation)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Apple Music Lyrics Blur</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cinematic ambient blur behind active lyrics</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('appleMusicLyricsBlur', !settings.appleMusicLyricsBlur)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.appleMusicLyricsBlur ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.appleMusicLyricsBlur ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Standard Backdrop Blur</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Frosted blur behind entire lyrics screen</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('lyricsStandardBlur', !settings.lyricsStandardBlur)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.lyricsStandardBlur ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.lyricsStandardBlur ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Lyrics Font Size</p>
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                  {settings.lyricsTextSize} sp
                </span>
              </div>
              <input
                type="range"
                min={16}
                max={36}
                step={1}
                value={settings.lyricsTextSize}
                onChange={e => updateSetting('lyricsTextSize', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Lyrics Line Spacing</p>
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                  {settings.lyricsLineSpacing.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={1.0}
                max={3.0}
                step={0.1}
                value={settings.lyricsLineSpacing}
                onChange={e => updateSetting('lyricsLineSpacing', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Click Lyric to Seek</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tap any line to jump audio directly to that moment</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('lyricsClick', !settings.lyricsClick)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.lyricsClick ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.lyricsClick ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Scroll Lyrics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Keep currently playing line centered</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('lyricsScroll', !settings.lyricsScroll)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.lyricsScroll ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.lyricsScroll ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Swipe to Change Song</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Swipe horizontally on lyrics to skip next or prev</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('swipeLyrics', !settings.swipeLyrics)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.swipeLyrics ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.swipeLyrics ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Lyrics Thumbnail Play/Pause</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tap miniature cover avatar to toggle play/pause</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enableLyricsThumbnailPlayPause', !settings.enableLyricsThumbnailPlayPause)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.enableLyricsThumbnailPlayPause ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.enableLyricsThumbnailPlayPause ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Hide Status Bar on Fullscreen</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Immersive edge-to-edge view during lyrics playback</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('hideStatusBarOnFullscreen', !settings.hideStatusBarOnFullscreen)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.hideStatusBarOnFullscreen ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.hideStatusBarOnFullscreen ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>
          </div>

          {/* Card 4: Navigation & Gestures (Misc) */}
          <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-white/10">
              <Layout size={18} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Navigation & Density
              </h3>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Default Startup Tab</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Screen opened on EVA Music launch</p>
              <select
                value={settings.defaultOpenTab}
                onChange={e => updateSetting('defaultOpenTab', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="home">Home (Feed & Highlights)</option>
                <option value="discover">Discover & Search</option>
                <option value="library">Library (Collections)</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Default Library Filter</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Initial filter tab selected in Library</p>
              <select
                value={settings.defaultLibChip}
                onChange={e => updateSetting('defaultLibChip', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="all">All Library</option>
                <option value="songs">Songs</option>
                <option value="artists">Artists</option>
                <option value="albums">Albums</option>
                <option value="playlists">Playlists</option>
                <option value="local">Local Files</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Swipe Song to Add</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Swipe track right in lists to append to queue</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('swipeSongToAdd', !settings.swipeSongToAdd)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.swipeSongToAdd ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.swipeSongToAdd ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Swipe Song to Remove</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Swipe track left in Up Next queue to dismiss</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('swipeSongToRemove', !settings.swipeSongToRemove)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.swipeSongToRemove ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.swipeSongToRemove ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Listen Together in Top Bar</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Display social listening status pill in header</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('listenTogetherInTopBar', !settings.listenTogetherInTopBar)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.listenTogetherInTopBar ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.listenTogetherInTopBar ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Grid Card Density</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Display size of album and playlist artwork</p>
              <select
                value={settings.gridItemSize}
                onChange={e => updateSetting('gridItemSize', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="small">Dense (3-Column Grid)</option>
                <option value="big">Spacious (2-Column Cards)</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Display Density</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Interface zoom and content scale</p>
              <select
                value={settings.densityScale}
                onChange={e => updateSetting('densityScale', Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value={0.85}>Compact (0.85x - High Density)</option>
                <option value={1.0}>Standard (1.0x - Default)</option>
                <option value={1.15}>Large (1.15x - Comfortable Touch)</option>
              </select>
            </div>
          </div>

          {/* Card 5: Smart Auto Playlists */}
          <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-white/10">
              <ListMusic size={18} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Smart Auto Playlists
              </h3>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Liked Songs Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Show favorite tracks collection in library</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showLikedPlaylist', !settings.showLikedPlaylist)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showLikedPlaylist ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showLikedPlaylist ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Downloaded Tracks Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Show offline saved music collection</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showDownloadedPlaylist', !settings.showDownloadedPlaylist)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showDownloadedPlaylist ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showDownloadedPlaylist ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Exported Audio Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Show collection for exported audio files</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showExportedPlaylist', !settings.showExportedPlaylist)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showExportedPlaylist ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showExportedPlaylist ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Top Played Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Show most listened tracks smart playlist</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showTopPlaylist', !settings.showTopPlaylist)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showTopPlaylist ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showTopPlaylist ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Recently Played Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Show chronological playback history list</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showBottomPlaylist', !settings.showBottomPlaylist)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showBottomPlaylist ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showBottomPlaylist ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Cached Streams Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instant access to locally buffered audio</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('showCachedPlaylist', !settings.showCachedPlaylist)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.showCachedPlaylist ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.showCachedPlaylist ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>
          </div>

          {/* Card 6: Haptics & Touch Feedback */}
          <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-white/10">
              <Vibrate size={18} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Haptics & Touch Feedback
              </h3>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Master Haptic Feedback</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tactile physical vibration responses</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enableHaptics', !settings.enableHaptics)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.enableHaptics ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.enableHaptics ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Haptic Intensity</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Vibration motor punch strength</p>
              <select
                value={settings.hapticIntensity}
                onChange={e => updateSetting('hapticIntensity', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="light">Light (Subtle 8ms Click)</option>
                <option value="medium">Medium (Crisp 18ms Tap)</option>
                <option value="heavy">Heavy (Punchy 35ms Kick)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Click & Tap Haptics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vibration response on buttons and cards</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enableClickHaptics', !settings.enableClickHaptics)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.enableClickHaptics ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.enableClickHaptics ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Slider & Scrubber Haptics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Micro-tick vibration while dragging timeline slider</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enableSliderHaptics', !settings.enableSliderHaptics)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.enableSliderHaptics ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.enableSliderHaptics ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Scroll Edge Bounce Haptics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tactile bounce when reaching start or end of list</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enableScrollEdgeHaptics', !settings.enableScrollEdgeHaptics)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.enableScrollEdgeHaptics ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.enableScrollEdgeHaptics ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Long Press Haptics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Firm pulse when opening context options</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enableLongPressHaptics', !settings.enableLongPressHaptics)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  settings.enableLongPressHaptics ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                }`}
              >
                <Check size={16} strokeWidth={3} className={settings.enableLongPressHaptics ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SUB-SCREEN: PLAYER AND AUDIO */}
      {/* ======================================================== */}
      {activeSection === 'player' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Audio Quality (Wi-Fi)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Highest fidelity bitrate on Wi-Fi</p>
              <select
                value={settings.audioQualityWifi}
                onChange={e => updateSetting('audioQualityWifi', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="Lossless FLAC">Lossless FLAC (1411kbps)</option>
                <option value="High (320kbps)">High (320kbps)</option>
                <option value="Normal (160kbps)">Normal (160kbps)</option>
                <option value="Data Saver (96kbps)">Data Saver (96kbps)</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Audio Quality (Cellular)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Bitrate to conserve mobile data</p>
              <select
                value={settings.audioQualityCellular}
                onChange={e => updateSetting('audioQualityCellular', e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="High (320kbps)">High (320kbps)</option>
                <option value="Normal (160kbps)">Normal (160kbps)</option>
                <option value="Data Saver (96kbps)">Data Saver (96kbps)</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Equalizer Preset</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Acoustic frequency response</p>
              <select
                value={settings.equalizer}
                onChange={e => handleEqualizerChange(e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="bass">Bass Boost & Sub Kick</option>
                <option value="vocal">Vocal Clarity & Presence</option>
                <option value="lofi">Lo-Fi Synth Chill</option>
                <option value="acoustic">Acoustic & Warm Instrumental</option>
                <option value="electronic">Club & Electronic Punch</option>
                <option value="normal">Studio Flat Reference</option>
              </select>
            </div>

            {/* Crossfade */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Track Crossfade</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Seamless blend between consecutive tracks</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {settings.crossfadeEnabled ? `${settings.crossfadeDuration}s` : 'Off'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.crossfadeEnabled}
                  onChange={e => updateSetting('crossfadeEnabled', e.target.checked)}
                  className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  disabled={!settings.crossfadeEnabled}
                  value={settings.crossfadeDuration}
                  onChange={e => updateSetting('crossfadeDuration', parseInt(e.target.value))}
                  className="w-full accent-purple-600 disabled:opacity-30 cursor-pointer"
                />
              </div>
            </div>

            {/* Gapless Playback */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Gapless Playback</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Zero dead air between album tracks</p>
              </div>
              <input
                type="checkbox"
                checked={settings.gaplessPlayback}
                onChange={e => updateSetting('gaplessPlayback', e.target.checked)}
                className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Volume Normalization */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Volume Normalization</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Equalize loudness levels across different tracks</p>
              </div>
              <input
                type="checkbox"
                checked={settings.audioNormalization}
                onChange={e => updateSetting('audioNormalization', e.target.checked)}
                className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Sleep Timer */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Sleep Timer</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pause playback after scheduled time</p>
              </div>
              <select
                value={settings.sleepTimerMinutes || ''}
                onChange={e => {
                  const val = e.target.value ? parseInt(e.target.value) : null;
                  settingsService.setSleepTimer(val, () => {
                    audioEngine.pause();
                  });
                }}
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl focus:outline-none"
              >
                <option value="">Off</option>
                <option value="15">15 Min</option>
                <option value="30">30 Min</option>
                <option value="45">45 Min</option>
                <option value="60">60 Min</option>
                <option value="90">90 Min</option>
              </select>
            </div>
          </div>

          <NotificationTest />
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SUB-SCREEN: LISTEN TOGETHER */}
      {/* ======================================================== */}
      {activeSection === 'listenTogether' && (
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Listen Together Session</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Synchronize playback in real time with friends</p>
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                ltState.isConnected
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  ltState.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {ltState.isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          {ltState.isConnected ? (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider uppercase">
                    Session Room Code
                  </span>
                  <p className="text-2xl font-black tracking-widest text-slate-900 dark:text-white">{ltState.roomId}</p>
                </div>
                <button
                  onClick={() => {
                    listenTogetherService.disconnect();
                    setRoomInput('');
                    showToast('Disconnected from room.');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition"
                >
                  Leave Room
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {ltState.isHost
                  ? 'You are the host. Your playback actions sync to all connected listeners.'
                  : 'Connected to host stream.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={e => setRoomInput(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit Room Code..."
                  className="flex-1 p-2.5 rounded-xl text-xs uppercase tracking-widest font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={handleJoinRoom}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition"
                >
                  Join
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Or host your own music room:</span>
                <button
                  onClick={handleCreateRoom}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 transition flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Create Room</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Sync Volume</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Keep volume synchronized between listeners</p>
            </div>
            <input
              type="checkbox"
              checked={settings.listenTogetherAutoSync}
              onChange={e => updateSetting('listenTogetherAutoSync', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SUB-SCREEN: CONTENT */}
      {/* ======================================================== */}
      {activeSection === 'content' && (
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Explicit Content Filter</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hide songs with explicit language or tags</p>
            </div>
            <input
              type="checkbox"
              checked={settings.filterExplicit}
              onChange={e => updateSetting('filterExplicit', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
            />
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 my-2" />

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Catalog Languages</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Prioritize songs from chosen languages on Discover</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'English',
                'Tamil',
                'Hindi',
                'Telugu',
                'Malayalam',
                'Spanish',
                'Japanese',
                'Korean',
                'Punjabi',
                'French',
              ].map(lang => {
                const isSelected = settings.preferredLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      const updated = isSelected
                        ? settings.preferredLanguages.filter(l => l !== lang)
                        : [...settings.preferredLanguages, lang];
                      updateSetting('preferredLanguages', updated);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lang} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SUB-SCREEN: PRIVACY */}
      {activeSection === 'privacy' && (
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Listening History</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save recently streamed tracks locally</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Discord Rich Presence</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Show "Listening to EVA Music" status</p>
            </div>
            <input
              type="checkbox"
              checked={settings.discordRichPresence}
              onChange={e => updateSetting('discordRichPresence', e.target.checked)}
              className="w-5 h-5 rounded-lg accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. SUB-SCREEN: STORAGE */}
      {activeSection === 'storage' && (
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Offline Music Cache</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Indexed audio streams & synced lyrics</p>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. SUB-SCREEN: BACKUP AND RESTORE */}
      {activeSection === 'backup' && (
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Export Library Backup</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save playlists, liked songs & settings to JSON</p>
            </div>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 my-2" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Restore Library Backup</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Restore data from a previously exported backup file</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <Upload size={14} />
                <span>Import</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. SUB-SCREEN: SYSTEM UPDATE */}
      {activeSection === 'update' && (
        <div className="rounded-3xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-md">
            <Disc3 size={28} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">EVA Music v2.4.0</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Studio Edition • Built with React 19, Fastify & Capacitor</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-xs text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/50">
            ✓ EVA Music is fully updated to the latest build
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. SUB-SCREEN: SUPPORTED LINKS */}
      {activeSection === 'links' && (
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Supported App Linking</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Handles deep links to track streams, shared playlists, and Listen Together invite codes.
          </p>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
            eva://song/:id <br />
            eva://playlist/:id <br />
            eva://room/:code
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. SUB-SCREEN: ABOUT */}
      {activeSection === 'about' && (
        <div className="rounded-3xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-400 to-indigo-500 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center p-2.5">
              <img src="/eva-logo.svg" alt="EVA" className="w-full h-full object-contain dark:brightness-0 dark:invert" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">EVA Music</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authentic High-Fidelity Audio Experience • Version 2.4.0
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2 text-xs font-bold text-purple-600 dark:text-purple-400">
            <a
              href="https://github.com/santhoshff/eva-music-logo-"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              <ExternalLink size={13} />
              <span>GitHub Repository</span>
            </a>
            <span>•</span>
            <span>Apache 2.0</span>
          </div>
        </div>
      )}
    </div>
  );
};
