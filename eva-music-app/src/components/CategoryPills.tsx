import React from 'react';

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-6 py-2 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center gap-2.5 min-w-max">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300 text-purple-950 shadow-md shadow-purple-200/50 scale-105 border border-purple-200'
                  : 'bg-white/60 hover:bg-white/90 text-slate-700 border border-white/80 shadow-2xs backdrop-blur-md active:scale-95'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
