import React, { useState } from 'react';
import { Play, Heart, Radio, Eye, Sparkles } from 'lucide-react';
import { Channel } from '../types/channel';
import { Category } from '../types/category';

interface ChannelCardProps {
  channel: Channel;
  category?: Category;
  isFavorite: boolean;
  onToggleFavorite: (channelId: string) => void;
  onSelectChannel: (channel: Channel) => void;
  layout?: 'grid' | 'list';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  category,
  isFavorite,
  onToggleFavorite,
  onSelectChannel,
  layout = 'grid',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(channel.id);
  };

  const formattedViewers = channel.viewersCount
    ? new Intl.NumberFormat('ar-EG').format(channel.viewersCount)
    : null;

  if (layout === 'list') {
    return (
      <div
        onClick={() => onSelectChannel(channel)}
        className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-cyan-950/20"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 flex items-center justify-center">
            {!imageError ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <Radio className="w-5 h-5 text-cyan-400" />
            )}
            {channel.isActive && (
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-900 animate-live" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-100 text-sm truncate group-hover:text-cyan-400 transition-colors">
                {channel.name}
              </h4>
              {channel.isFeatured && (
                <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>مميز</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xs sm:max-w-md">
              {channel.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pr-2">
          {channel.quality && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono font-semibold text-slate-300 border border-slate-700/60 hidden sm:inline-block">
              {channel.quality}
            </span>
          )}
          <button
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-cyan-600/90 group-hover:bg-cyan-500 text-white flex items-center justify-center shadow-md transition-all group-hover:scale-105">
            <Play className="w-4 h-4 fill-white translate-x-[-0.5px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectChannel(channel)}
      className="group relative flex flex-col rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-cyan-950/20 hover:-translate-y-1"
    >
      {/* Top Banner / Card Header with Ambient Image Preview */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-950/80 border-b border-slate-800/60">
        {!imageError ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-90 ${
              imageLoaded ? 'blur-0' : 'blur-sm'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
            <Radio className="w-10 h-10 text-cyan-500/40" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges: Live & Favorite Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            {channel.isActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-rose-600/90 text-white shadow-md shadow-rose-950/50 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-live" />
                <span>مباشر LIVE</span>
              </span>
            )}
            {channel.quality && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                {channel.quality}
              </span>
            )}
          </div>

          <button
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-md ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Play Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white translate-x-[-1px]" />
          </div>
        </div>

        {/* Channel Logo Pill bottom right */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 shadow-md shrink-0">
            <img
              src={channel.logo}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          </div>
          {category && (
            <span className="text-[11px] font-medium text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800 backdrop-blur-md">
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4 className="font-bold text-slate-100 text-sm group-hover:text-cyan-400 transition-colors truncate">
              {channel.name}
            </h4>
            {channel.isFeatured && (
              <span className="shrink-0 text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                <span>مميز</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {channel.description}
          </p>
        </div>

        {/* Card Footer info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            {formattedViewers && (
              <span className="inline-flex items-center gap-1 text-slate-400 font-mono">
                <Eye className="w-3.5 h-3.5 text-cyan-400/80" />
                <span>{formattedViewers}</span>
              </span>
            )}
            {channel.country && (
              <span className="text-slate-400">
                • {channel.country}
              </span>
            )}
          </div>
          <span className="text-cyan-400 font-medium group-hover:underline text-[11px]">
            مشاهدة البث ←
          </span>
        </div>
      </div>
    </div>
  );
};
