import React from 'react';
import { Play, Radio, Sparkles, Tv, ShieldCheck, Flame } from 'lucide-react';
import { Channel } from '../types/channel';

interface HeroProps {
  onStartWatching: () => void;
  onLiveClick: () => void;
  featuredChannel?: Channel | null;
  onPlayChannel?: (channel: Channel) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartWatching,
  onLiveClick,
  featuredChannel,
  onPlayChannel,
}) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950 to-[#070b14] border border-slate-800/80 p-6 sm:p-10 my-4 sm:my-6 shadow-2xl">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Content (Text & Call to Actions) */}
        <div className="flex-1 space-y-5 text-right max-w-2xl">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-xs font-semibold shadow-inner">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-live" />
            <span>منصة البث المباشر والقنوات العربية الحديثة</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              شاشتك <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 via-teal-300 to-blue-400">فـ جيبك</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 font-medium">
              كل قنواتك المفضلة في مكان واحد
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
            شاهد البث الحي لأشهر القنوات الإخبارية، الرياضية، الوثائقية، والدينية بجودة عالية وبدون تقطيع، متوافقة تمامًا مع هاتفك الذكي وحاسوبك في أي وقت ومن أي مكان.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onStartWatching}
              className="flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-950/60 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ابدأ المشاهدة</span>
            </button>

            <button
              onClick={onLiveClick}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-sm transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-live" />
              <span>🔴 مباشر الآن</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-4 pt-3 text-[11px] text-slate-400 border-t border-slate-800/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>بثوث قانونية حرة مجانية</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-emerald-400" />
              <span>دعم FHD و 4K</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>تصميم Mobile First</span>
            </span>
          </div>
        </div>

        {/* Right Content (Featured Channel Preview Card or Standby State) */}
        {featuredChannel && onPlayChannel ? (
          <div className="w-full lg:w-80 shrink-0">
            <div
              onClick={() => onPlayChannel(featuredChannel)}
              className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/40 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 px-1">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>القناة المقترحة لك</span>
                </span>
                <span className="font-mono text-[11px] text-cyan-400">
                  {featuredChannel.quality}
                </span>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={featuredChannel.logo}
                  alt={featuredChannel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white translate-x-[-0.5px]" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-xs text-white">
                  <span className="font-bold truncate">{featuredChannel.name}</span>
                  <span className="text-[10px] bg-rose-600 px-1.5 py-0.5 rounded font-bold">
                    LIVE
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-1 px-1">
                {featuredChannel.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-80 shrink-0">
            <div className="relative rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 text-center flex flex-col items-center justify-center shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mb-3.5 shadow-inner">
                <Tv className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">
                بث القنوات الفضائية
              </h3>
              <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                لا توجد قنوات متاحة حاليًا، سيتم إضافة القنوات قريبًا وتفعيل البث الحي.
              </p>
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>الواجهة جاهزة لاستقبال القنوات</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
