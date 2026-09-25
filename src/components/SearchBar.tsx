import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  resultCount?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onClear,
  resultCount,
  placeholder = 'ابحث باسم القناة، التصنيف، أو الكلمات المفتاحية...',
  autoFocus = false,
}) => {
  const quickTags = ['أخبار', 'قرآن', 'رياضة', 'أفلام', 'أطفال'];

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      <div className="relative flex items-center">
        <div className="absolute right-4 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5 text-cyan-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full h-12 sm:h-14 pr-12 pl-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/40 focus:border-cyan-500 text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-lg shadow-black/40 backdrop-blur-md"
        />

        {query && (
          <button
            onClick={onClear}
            className="absolute left-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Tags Suggestions */}
      <div className="flex items-center gap-2 mt-2.5 px-1 overflow-x-auto pb-1 text-xs text-slate-400">
        <span className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>مقترحات سريعة:</span>
        </span>
        {quickTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onQueryChange(tag)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 hover:text-cyan-300 border border-slate-700/60 text-slate-300 text-xs transition-colors shrink-0"
          >
            {tag}
          </button>
        ))}

        {typeof resultCount === 'number' && query.trim() && (
          <span className="mr-auto font-mono text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40 shrink-0">
            {resultCount} نتيجة
          </span>
        )}
      </div>
    </div>
  );
};
