import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCw, 
  Heart, 
  Share2, 
  X, 
  AlertCircle, 
  Tv, 
  Radio, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Info
} from 'lucide-react';
import { Channel } from '../types/channel';
import { Category } from '../types/category';

interface VideoPlayerProps {
  channel: Channel;
  category?: Category;
  channelsList?: Channel[];
  isFavorite: boolean;
  onToggleFavorite: (channelId: string) => void;
  onClose: () => void;
  onSelectChannel?: (channel: Channel) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  category,
  channelsList = [],
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectChannel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize and load stream
  const initPlayer = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    // Destroy prior HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.streamUrl;

    if (!streamUrl || !streamUrl.trim()) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('لا يتوفر رابط بث مباشر مخصص لهذه القناة حاليًا. سيتم تفعيل البث فور إضافته من لوحة الإدارة.');
      setIsPlaying(false);
      return;
    }

    if (channel.streamType === 'embed') {
      setIsLoading(false);
      return;
    }

    // Check HLS support
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setIsPlaying(false);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network Error, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, recovering media...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS Error:', data);
              hls.destroy();
              setHasError(true);
              setErrorMessage('تعذر تشغيل البث حاليًا. قد يكون المصدر غير متاح أو مقيد جغرافيًا.');
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS for Safari iOS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setIsPlaying(false);
      });
      video.addEventListener('error', () => {
        setHasError(true);
        setErrorMessage('تعذر تشغيل البث عبر المشغل المدمج.');
        setIsLoading(false);
      });
    } else {
      // Regular MP4 or other supported types
      video.src = streamUrl;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
        setIsPlaying(false);
      });
      video.addEventListener('error', () => {
        setHasError(true);
        setErrorMessage('صيغة البث غير مدعومة على متصفحك.');
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, channel.streamUrl]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2500);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
    setControlsTimeout(timeout);
  };

  // Next / Previous channel
  const currentIndex = channelsList.findIndex((c) => c.id === channel.id);
  const prevChannel = currentIndex > 0 ? channelsList[currentIndex - 1] : null;
  const nextChannel = currentIndex < channelsList.length - 1 ? channelsList[currentIndex + 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050810]/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      {/* Top Bar with Navigation & Channel Info */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">العودة للقنوات</span>
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {channel.name}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {category && <span>{category.name}</span>}
                {channel.quality && (
                  <span className="text-cyan-400 font-mono">• {channel.quality}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleFavorite(channel.id)}
            aria-label="المفضلة"
            className={`p-2.5 rounded-xl transition-all ${
              isFavorite
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-900 text-slate-300 hover:text-rose-400 border border-slate-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            aria-label="مشاركة القناة"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors relative"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            aria-label="إغلاق المشغل"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {showCopiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          <span>تم نسخ رابط القناة بنجاح!</span>
        </div>
      )}

      {/* Main Player Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-start">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative w-full aspect-video rounded-2xl sm:rounded-3xl bg-black border border-slate-800/80 overflow-hidden shadow-2xl flex items-center justify-center group"
        >
          {channel.streamType === 'embed' ? (
            <iframe
              src={channel.streamUrl}
              title={channel.name}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
            />
          )}

          {/* Loading Spinner */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <div className="w-12 h-12 rounded-full border-3 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
              <p className="text-xs text-slate-300 font-medium">جاري تشغيل البث المباشر...</p>
            </div>
          )}

          {/* Error Message Overlay */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-md z-20">
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-900/60 text-rose-400 mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1">
                تعذر تشغيل البث حاليًا
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
                {errorMessage || 'قد يكون رابط البث الخارجي غير نشط مؤقتًا أو يحتاج إلى اتصال أسرع.'}
              </p>
              <button
                onClick={initPlayer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-cyan-900/40 transition-all active:scale-95"
              >
                <RotateCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}

          {/* Floating LIVE Pill & Watermark */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600/90 text-white shadow-lg shadow-rose-950/50 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-white animate-live" />
              <span>مباشر LIVE</span>
            </span>
          </div>

          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider bg-black/60 text-slate-300 border border-white/10 shadow-lg backdrop-blur-md select-none">
              MR. DARK • SHASHTAK
            </span>
          </div>

          {/* Center Play Button Overlay for Manual Playback */}
          {!isPlaying && !isLoading && !hasError && channel.streamType !== 'embed' && (
            <button
              onClick={togglePlay}
              aria-label="تشغيل البث المباشر"
              className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-cyan-950/60 transition-transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-[-1px]" />
            </button>
          )}

          {/* Video Controls Overlay */}
          {channel.streamType !== 'embed' && (
            <div
              className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-20 flex flex-col gap-2 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3">
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white translate-x-[-0.5px]" />
                    )}
                  </button>

                  {/* Volume / Mute */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      aria-label={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-slate-200" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="مستوى الصوت"
                      className="w-16 sm:w-24 h-1.5 rounded-lg bg-white/20 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Refresh Stream */}
                  <button
                    onClick={initPlayer}
                    aria-label="تحديث البث"
                    title="إعادة مزامنة البث"
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 select-none px-1.5 py-0.5 rounded bg-black/40 border border-white/10 hidden sm:inline-block">
                    MR. DARK • SHASHTAK
                  </span>

                  {/* Quality Pill */}
                  {channel.quality && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                      {channel.quality}
                    </span>
                  )}

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Channel Details Card Below Player */}
        <div className="mt-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100">
                {channel.name}
              </h1>
              {channel.isFeatured && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  مميزة ⭐
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
              {channel.description}
            </p>
            {channel.tags && channel.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {channel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800/80 text-slate-400 border border-slate-700/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Prev / Next Channel Switcher */}
          {onSelectChannel && (
            <div className="flex items-center gap-2 self-start md:self-center shrink-0 pt-2 md:pt-0">
              {prevChannel && (
                <button
                  onClick={() => onSelectChannel(prevChannel)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700/60"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابقة</span>
                </button>
              )}
              {nextChannel && (
                <button
                  onClick={() => onSelectChannel(nextChannel)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700/60"
                >
                  <span>التالية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Channels Quick-Switch Strip Below */}
        {channelsList.length > 0 && onSelectChannel && (
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>قنوات أخرى للمشاهدة السريعة</span>
              </h3>
              <span className="text-xs text-slate-500">
                اضغط للتنقل المباشر
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {channelsList
                .filter((c) => c.id !== channel.id)
                .slice(0, 10)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectChannel(c)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 transition-all shrink-0 w-52 text-right group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                      <img
                        src={c.logo}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-400">
                        {c.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {c.quality || 'بث مباشر'}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
