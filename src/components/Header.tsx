import React from 'react';
import { 
  Tv, 
  Search, 
  Heart, 
  Compass, 
  Home,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'channels' | 'favorites' | 'search';
  onSelectTab: (tab: 'home' | 'channels' | 'favorites' | 'search') => void;
  favoritesCount: number;
  onNavigateAdmin: () => void;
  isAdminAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  onNavigateAdmin,
  isAdminAuthenticated = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b14]/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px] shadow-lg shadow-cyan-950/40">
            <div className="w-full h-full rounded-2xl bg-[#090e1a] flex items-center justify-center group-hover:bg-[#0c1424] transition-colors">
              <Tv className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-[#070b14] animate-live" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                شاشتك فـ جيبك
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 hidden sm:inline-block">
                LIVE
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
              Shashtak Platform
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => onSelectTab('channels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>القنوات</span>
          </button>

          <button
            onClick={() => onSelectTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>المفضلة</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-rose-500 text-white">
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => onSelectTab('search')}
            aria-label="البحث عن القنوات"
            className={`flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">بحث سريع</span>
          </button>

          {/* Admin Navigation Button */}
          <button
            onClick={onNavigateAdmin}
            title={isAdminAuthenticated ? 'بوابة إدارة المنصة' : 'دخول مسؤولي المنصة'}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isAdminAuthenticated
                ? 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-800/60 shadow-sm shadow-cyan-950/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            {isAdminAuthenticated ? (
              <>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">بوابة الإدارة</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">دخول الإدارة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
