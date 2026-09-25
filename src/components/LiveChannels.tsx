import React from 'react';
import { Radio, ArrowLeft } from 'lucide-react';
import { Channel } from '../types/channel';
import { Category } from '../types/category';
import { ChannelCard } from './ChannelCard';

interface LiveChannelsProps {
  channels: Channel[];
  categories: Category[];
  favoriteIds: string[];
  onToggleFavorite: (channelId: string) => void;
  onSelectChannel: (channel: Channel) => void;
  onViewAll?: () => void;
}

export const LiveChannels: React.FC<LiveChannelsProps> = ({
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
    <section id="live-section" className="my-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Radio className="w-5 h-5 animate-live" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                🔴 مباشر الآن
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {channels.length} قنوات تبث حاليًا
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تابع البث الفضائي الحي لأهم القنوات لحظة بلحظة
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>تصفح البثوث</span>
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
