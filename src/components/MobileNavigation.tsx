import React from 'react';
import { Home, Compass, Heart, Search, Radio } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: 'home' | 'channels' | 'favorites' | 'search';
  onSelectTab: (tab: 'home' | 'channels' | 'favorites' | 'search') => void;
  favoritesCount: number;
}

interface NavTabItem {
  id: 'home' | 'channels' | 'favorites' | 'search';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
}) => {
  const tabs: NavTabItem[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'channels', label: 'القنوات', icon: Compass },
    { id: 'favorites', label: 'المفضلة', icon: Heart, count: favoritesCount },
    { id: 'search', label: 'البحث', icon: Search },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#070b14]/95 backdrop-blur-2xl border-t border-slate-800/80 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all select-none relative ${
                isActive ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
