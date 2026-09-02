import React, { useState } from 'react';
import { Sliders, HardDrive, Bell, Volume2 } from 'lucide-react';
import { UserProfile } from '../types';
import { audioEngine } from '../services/audioEngine';

interface SettingsScreenProps {
  profile?: UserProfile;
  onOpenProfile?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const [audioQuality, setAudioQuality] = useState('Lossless FLAC');
  const [equalizer, setEqualizer] = useState<'normal' | 'bass' | 'vocal' | 'lofi'>('bass');
  const [downloadOffline, setDownloadOffline] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleEqualizerChange = (preset: 'normal' | 'bass' | 'vocal' | 'lofi') => {
    setEqualizer(preset);
    audioEngine.setEqualizerPreset(preset);
  };

  return (
    <div className="flex flex-col gap-5 pb-36 w-full max-w-md mx-auto px-6">
      {/* Settings Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">Customize your playback & app experience</p>
      </div>

      {/* Audio Playback Settings Group */}
      <div className="rounded-3xl p-4 bg-white/70 backdrop-blur-2xl border border-white/90 shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-900/60">Audio Quality & Sound</h4>

        {/* Audio Quality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Volume2 size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Audio Quality</p>
              <p className="text-xs text-slate-500">High fidelity streaming rate</p>
            </div>
          </div>
          <select
            value={audioQuality}
            onChange={(e) => setAudioQuality(e.target.value)}
            className="text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="Lossless FLAC">Lossless FLAC</option>
            <option value="High (320kbps)">High (320kbps)</option>
            <option value="Normal (160kbps)">Normal (160kbps)</option>
          </select>
        </div>

        {/* Equalizer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Sliders size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Equalizer Preset</p>
              <p className="text-xs text-slate-500">Acoustic response curve</p>
            </div>
          </div>
          <select
            value={equalizer}
            onChange={(e) => handleEqualizerChange(e.target.value as 'normal' | 'bass' | 'vocal' | 'lofi')}
            className="text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="bass">Bass Boost & Kick</option>
            <option value="vocal">Vocal Clarity</option>
            <option value="lofi">Lo-Fi Synth</option>
            <option value="normal">Flat Studio</option>
          </select>
        </div>
      </div>

      {/* Preferences Group */}
      <div className="rounded-3xl p-4 bg-white/70 backdrop-blur-2xl border border-white/90 shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-900/60">App Preferences</h4>

        {/* Download Offline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <HardDrive size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Offline Downloads</p>
              <p className="text-xs text-slate-500">Auto-download favorite tracks</p>
            </div>
          </div>
          <button
            onClick={() => setDownloadOffline(!downloadOffline)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              downloadOffline ? 'bg-purple-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              downloadOffline ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">New Release Alerts</p>
              <p className="text-xs text-slate-500">Notifications from followed artists</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              notifications ? 'bg-purple-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              notifications ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};
