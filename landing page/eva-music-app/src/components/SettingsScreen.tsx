import React, { useState } from 'react';
import { Sliders, Volume2, LogIn, LogOut, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types';
import { audioEngine } from '../services/audioEngine';

interface SettingsScreenProps {
  profile?: UserProfile;
  onOpenProfile?: () => void;
  currentUser?: any;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [audioQuality, setAudioQuality] = useState('Lossless FLAC');
  const [equalizer, setEqualizer] = useState<'normal' | 'bass' | 'vocal' | 'lofi'>('bass');

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

      {/* Account & Authentication Group */}
      <div className="rounded-3xl p-4 bg-white/70 backdrop-blur-2xl border border-white/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-900/60">Account & Cloud Sync</h4>
          {currentUser ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Synced
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full">
              <ShieldCheck size={12} />
              Cloud Sync
            </span>
          )}
        </div>

        {/* User Info Preview */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 shadow-md flex-none overflow-hidden">
            {currentUser?.user_metadata?.avatar_url || profile?.avatarUrl ? (
              <img
                src={currentUser?.user_metadata?.avatar_url || profile?.avatarUrl}
                alt="User Avatar"
                className="w-full h-full object-cover rounded-[14px]"
              />
            ) : (
              <div className="w-full h-full bg-purple-100 text-purple-700 rounded-[14px] flex items-center justify-center font-bold">
                <User size={20} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-sm text-slate-900 truncate">
              {currentUser ? (currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Member') : 'Guest Listener'}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {currentUser ? currentUser.email : 'Sign in to sync your library across devices'}
            </p>
          </div>
        </div>

        {/* Action Button: Login / Sign Out */}
        {currentUser ? (
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <LogIn size={18} />
            <span>Log In or Sign Up</span>
          </button>
        )}
      </div>
    </div>
  );
};
