import React from 'react';
import { Tv, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const ChannelCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800/80 overflow-hidden relative">
      <div className="skeleton-shimmer h-40 w-full rounded-xl mb-4" />
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer w-11 h-11 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
};

export const ChannelGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChannelCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-3xl p-8 bg-slate-900/40 border border-slate-800/60 my-6">
      <div className="skeleton-shimmer h-8 w-40 rounded-full mb-6" />
      <div className="skeleton-shimmer h-12 w-3/4 max-w-xl rounded-xl mb-4" />
      <div className="skeleton-shimmer h-5 w-1/2 max-w-md rounded mb-8" />
      <div className="flex gap-4">
        <div className="skeleton-shimmer h-12 w-36 rounded-xl" />
        <div className="skeleton-shimmer h-12 w-36 rounded-xl" />
      </div>
    </div>
  );
};
