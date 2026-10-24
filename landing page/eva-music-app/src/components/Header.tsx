import React from 'react';
import { History, TrendingUp, Users, Settings, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  userName?: string;
  userAvatarUrl?: string;
  onOpenSearch?: () => void;
  onOpenFavorites?: () => void;
  onOpenProfile?: () => void;
  onOpenHistory?: () => void;
  onOpenTrending?: () => void;
  onOpenListenTogether?: () => void;
  onOpenSettings?: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFavorites,
  onOpenHistory,
  onOpenTrending,
  onOpenListenTogether,
  onOpenSettings,
  title,
  subtitle,
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="relative flex items-center justify-between px-5 pt-5 pb-3 w-full max-w-md mx-auto">
      {/* Official EVA Music Logo & Heading */}
      <div className="flex items-center gap-3">
        <div
          className="relative group cursor-pointer active:scale-95 transition-transform"
          title="EVA Music"
          onClick={onOpenSettings}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-purple-500 via-pink-400 to-indigo-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
          <div className="relative w-11 h-11 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 border-2 border-white/90 dark:border-white/10 shadow-sm flex items-center justify-center">
            <img
              src="/eva-logo.svg"
              alt="EVA MUSIC"
              className="w-full h-full object-contain dark:brightness-0 dark:invert transition-all"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans transition-colors">
              {title || 'EVA MUSIC'}
            </h1>
            {!title && (
              <span className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 transition-colors">
                <Sparkles size={12} />
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-purple-900/60 dark:text-purple-300/60 tracking-wide uppercase transition-colors">
            {subtitle || 'Feel the Music'}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* History */}
        <button
          onClick={onOpenHistory || onOpenFavorites}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all"
          aria-label="History"
          title="Listening History"
        >
          <History size={18} />
        </button>

        {/* Trending */}
        <button
          onClick={onOpenTrending}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all"
          aria-label="Trending"
          title="Trending Hits"
        >
          <TrendingUp size={18} />
        </button>

        {/* Listen Together */}
        <button
          onClick={onOpenListenTogether}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all"
          aria-label="Listen Together"
          title="Listen Together"
        >
          <Users size={18} />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all"
          aria-label="Settings"
          title="Settings & Preferences"
        >
          <Settings size={18} />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all ml-0.5"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
