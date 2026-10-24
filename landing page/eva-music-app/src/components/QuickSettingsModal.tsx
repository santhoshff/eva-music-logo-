import React from 'react';
import { User, Settings, Info, Sparkles, X } from 'lucide-react';
import { UserProfile } from '../types';

interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  profile?: UserProfile;
  onOpenLogin?: () => void;
  onOpenProfile?: () => void;
  onNavigateToSettings: (section?: string) => void;
}

export const QuickSettingsModal: React.FC<QuickSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profile,
  onOpenLogin,
  onOpenProfile,
  onNavigateToSettings,
}) => {
  if (!isOpen) return null;

  const displayName = currentUser?.user_metadata?.full_name || profile?.name || 'EVA Guest Explorer';
  const displayStatus = currentUser?.email || (profile?.handle ? `@${profile.handle}` : 'Offline / Local Account');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-t-[32px] border-t border-slate-200 dark:border-white/10 shadow-2xl px-6 pt-3 pb-8 flex flex-col gap-4 select-none animate-slide-up">
        {/* Top Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-1.5" />

        {/* Section: Account */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-1">
            Account
          </span>

          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-200/60 dark:divide-white/5 shadow-xs">
            {/* Account / User */}
            <button
              onClick={() => {
                onClose();
                if (currentUser) {
                  onOpenProfile?.();
                } else {
                  onOpenLogin?.();
                }
              }}
              className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">
                <User size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayStatus}</p>
              </div>
            </button>

            {/* AI Hub */}
            <button
              onClick={() => {
                onClose();
                onNavigateToSettings('ai');
              }}
              className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                Ai
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">AI Hub</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-powered lyrics and translations</p>
              </div>
            </button>
          </div>
        </div>

        {/* Section: App */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-1">
            App
          </span>

          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-200/60 dark:divide-white/5 shadow-xs">
            {/* Settings */}
            <button
              onClick={() => {
                onClose();
                onNavigateToSettings('menu');
              }}
              className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <Settings size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Settings</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">App preferences and configurations</p>
              </div>
            </button>

            {/* About */}
            <button
              onClick={() => {
                onClose();
                onNavigateToSettings('about');
              }}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Info size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">About EVA Music</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full">
                v2.4.0
              </span>
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-3 pt-2 text-xs font-semibold text-slate-400">
          <button
            onClick={() => {
              onClose();
              onNavigateToSettings('privacy');
            }}
            className="hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => {
              onClose();
              onNavigateToSettings('about');
            }}
            className="hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};
