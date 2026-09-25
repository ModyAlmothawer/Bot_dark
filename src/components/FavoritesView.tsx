import React from 'react';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';
import { Channel } from '../types/channel';
import { Category } from '../types/category';
import { ChannelCard } from './ChannelCard';
import { EmptyState } from './EmptyState';

interface FavoritesViewProps {
  channels: Channel[];
  categories: Category[];
  favoriteIds: string[];
  onToggleFavorite: (channelId: string) => void;
  onSelectChannel: (channel: Channel) => void;
  onClearAllFavorites: () => void;
  onBrowseChannels: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  channels,
  categories,
  favoriteIds,
  onToggleFavorite,
  onSelectChannel,
  onClearAllFavorites,
  onBrowseChannels,
}) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="my-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              قنواتي المفضلة
            </h2>
            <p className="text-xs text-slate-400">
              قائمتك الشخصية للوصول السريع إلى البثوث المفضلة ({channels.length} قناة)
            </p>
          </div>
        </div>

        {channels.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من مسح جميع القنوات من المفضلة؟')) {
                onClearAllFavorites();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح المفضلة</span>
          </button>
        )}
      </div>

      {/* List or Empty State */}
      {channels.length === 0 ? (
        <EmptyState
          type="favorites"
          title="لم تقم بإضافة أي قناة للمفضلة بعد"
          description="اضغط على أيقونة القلب في بطاقة أي قناة لإضافتها إلى قائمتك المفضلة والوصول إليها بسرعة من هنا."
          actionText="تصفح القنوات الآن"
          onAction={onBrowseChannels}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              category={categoryMap.get(channel.categoryId)}
              isFavorite={favoriteIds.includes(channel.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectChannel={onSelectChannel}
              layout="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
};
