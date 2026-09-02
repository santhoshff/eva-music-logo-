import React from 'react';
import { Search, Heart, Sparkles } from 'lucide-react';

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
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4 w-full max-w-md mx-auto">
      {/* Left Logo / Brand Title */}
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer active:scale-95 transition-transform" title="EVA Music">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-purple-500 via-pink-400 to-indigo-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
          <div className="relative w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md p-1.5 border-2 border-white/90 shadow-sm flex items-center justify-center">
            <img
              src="/eva-logo.svg"
              alt="EVA MUSIC"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
              {title || 'EVA MUSIC'}
            </h1>
            {!title && (
              <span className="p-1 rounded-full bg-purple-100 text-purple-600">
                <Sparkles size={12} />
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-purple-900/60 tracking-wide uppercase">
            {subtitle || 'Feel the Music'}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-600 hover:bg-white transition-all active:scale-95"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}

        {onOpenFavorites && (
          <button
            onClick={onOpenFavorites}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-pink-600 hover:bg-white transition-all active:scale-95"
            aria-label="Favorites"
          >
            <Heart size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
