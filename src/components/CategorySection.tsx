import React from 'react';
import { 
  Tv, 
  Trophy, 
  Newspaper, 
  BookOpen, 
  Film, 
  Baby, 
  Compass, 
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { Category } from '../types/category';

interface CategorySectionProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  channelCounts?: Record<string, number>;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  channelCounts = {},
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-4 h-4" />;
      case 'Newspaper':
        return <Newspaper className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Film':
        return <Film className="w-4 h-4" />;
      case 'Baby':
        return <Baby className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Tv':
      default:
        return <Tv className="w-4 h-4" />;
    }
  };

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            التصنيفات
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          اختر التصنيف للتصفية السريعة
        </span>
      </div>

      {/* Horizontal Scrollable Categories Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = channelCounts[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/40 scale-[1.02]'
                  : 'bg-slate-900/70 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span
                className={`transition-colors ${
                  isSelected ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                }`}
              >
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
