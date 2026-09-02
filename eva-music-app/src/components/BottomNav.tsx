import React from 'react';
import { Home, Music2, Compass, Settings } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Your Music', icon: Music2 },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 px-6 w-full max-w-md mx-auto pointer-events-auto">
      <nav className="flex items-center justify-around py-2.5 px-3 rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-tr from-purple-400 via-purple-300 to-indigo-300 text-purple-950 shadow-md shadow-purple-200/60 scale-105'
                  : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50/50'
              }`}
              aria-label={item.label}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
