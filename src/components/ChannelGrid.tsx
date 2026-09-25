import React, { useState } from 'react';
import { LayoutGrid, List, SlidersHorizontal, Tv } from 'lucide-react';
import { Channel } from '../types/channel';
import { Category } from '../types/category';
import { ChannelCard } from './ChannelCard';
import { EmptyState } from './EmptyState';

interface ChannelGridProps {
  channels: Channel[];
  categories: Category[];
  favoriteIds: string[];
  onToggleFavorite: (channelId: string) => void;
  onSelectChannel: (channel: Channel) => void;
  title?: string;
  description?: string;
  selectedCategoryName?: string;
  onResetFilter?: () => void;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  categories,
  favoriteIds,
  onToggleFavorite,
  onSelectChannel,
  title = 'جميع القنوات',
  description = 'تصفح كل القنوات المتاحة مع إمكانية الترتيب والبحث',
  selectedCategoryName,
  onResetFilter,
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'viewers' | 'name'>('default');

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const sortedChannels = [...channels].sort((a, b) => {
    if (sortBy === 'viewers') {
      return (b.viewersCount || 0) - (a.viewersCount || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ar');
    }
    return (a.order ?? 99) - (b.order ?? 99);
  });

  return (
    <section id="all-channels-section" className="my-8">
      {/* Header with Title and View/Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                {title}
              </h3>
              {selectedCategoryName && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  {selectedCategoryName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {description} ({channels.length} قناة)
            </p>
          </div>
        </div>

        {/* Controls: Layout Toggle & Sort */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="viewers">الأكثر مشاهدة</option>
              <option value="name">أبجديًا (أ-ي)</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Layout Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setLayout('grid')}
              aria-label="عرض شبكي"
              className={`p-1.5 rounded-lg transition-colors ${
                layout === 'grid'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              aria-label="عرض قائمة"
              className={`p-1.5 rounded-lg transition-colors ${
                layout === 'list'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Empty */}
      {sortedChannels.length === 0 ? (
        <EmptyState
          type="category"
          title={selectedCategoryName ? `لا توجد قنوات متاحة في تصنيف (${selectedCategoryName})` : "لا توجد قنوات متاحة حاليًا"}
          description="سيتم إضافة القنوات قريبًا من خلال لوحة الإدارة وقاعدة البيانات."
          actionText={selectedCategoryName && onResetFilter ? 'عرض كل القنوات' : undefined}
          onAction={onResetFilter}
        />
      ) : (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
              : 'space-y-3'
          }
        >
          {sortedChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              category={categoryMap.get(channel.categoryId)}
              isFavorite={favoriteIds.includes(channel.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectChannel={onSelectChannel}
              layout={layout}
            />
          ))}
        </div>
      )}
    </section>
  );
};
