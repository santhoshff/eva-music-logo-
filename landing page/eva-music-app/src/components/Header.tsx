import React, { useState } from 'react';
import { Search, Heart, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  userName?: string;
  userAvatarUrl?: string;
  onOpenSearch?: () => void;
  onOpenFavorites?: () => void;
  onOpenProfile?: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Samantha',
  userAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  onOpenSearch,
  onOpenFavorites,
  onOpenProfile,
  title,
  subtitle
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="relative flex items-center justify-between px-6 pt-6 pb-4 w-full max-w-md mx-auto">
      {/* Left Logo / Brand Title */}
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer active:scale-95 transition-transform" title="EVA Music">
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
      <div className="flex items-center gap-2">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-purple-600 hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}

        {onOpenFavorites && (
          <button
            onClick={onOpenFavorites}
            className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center text-slate-700 dark:text-pink-400 hover:text-pink-600 hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95"
            aria-label="Favorites"
          >
            <Heart size={18} />
          </button>
        )}

        {/* Simple, reliable Dark/Light theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full backdrop-blur-md border shadow-sm flex items-center justify-center transition-all duration-300 active:scale-95
            bg-slate-900 border-slate-700 text-yellow-300
            dark:bg-amber-400 dark:border-amber-300 dark:text-slate-900"
          aria-label="Toggle dark mode"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
