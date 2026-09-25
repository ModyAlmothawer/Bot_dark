import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Channel } from '../types/channel';
import { Category } from '../types/category';
import { ChannelCard } from './ChannelCard';

interface FeaturedChannelsProps {
  channels: Channel[];
  categories: Category[];
  favoriteIds: string[];
  onToggleFavorite: (channelId: string) => void;
  onSelectChannel: (channel: Channel) => void;
  onViewAll?: () => void;
}

export const FeaturedChannels: React.FC<FeaturedChannelsProps> = ({
  channels,
  categories,
  favoriteIds,
  onToggleFavorite,
  onSelectChannel,
  onViewAll,
}) => {
  if (channels.length === 0) return null;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              القنوات المميزة
            </h3>
            <p className="text-xs text-slate-400">
              قنوات مختارة ذات جودة بث عالية ومتابعة مستمرة
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {channels.slice(0, 4).map((channel) => (
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
    </section>
  );
};
