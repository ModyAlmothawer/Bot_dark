/**
 * إعدادات منصة "شاشتك فـ جيبك"
 * جميع الألوان والروابط والإعدادات قابلة للتخصيص من هنا بسهولة
 */

export type AccentTheme = 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';

export interface AppConfig {
  appName: string;
  appShortName: string;
  appTagline: string;
  appDescription: string;
  currentAccent: AccentTheme;
  features: {
    enableSearch: boolean;
    enableFavorites: boolean;
    enableCategoryFilter: boolean;
    enableAdsSlots: boolean;
    enableHlsStreaming: boolean;
  };
  streaming: {
    autoPlay: boolean;
    streamTimeoutSeconds: number;
    defaultVolume: number;
  };
  contact: {
    telegram?: string;
    twitter?: string;
    supportEmail: string;
  };
}

export const APP_CONFIG: AppConfig = {
  appName: 'شاشتك فـ جيبك',
  appShortName: 'Shashtak',
  appTagline: 'كل قنواتك المفضلة في مكان واحد',
  appDescription: 'المنصة العربية الحديثة لمشاهدة القنوات الفضائية والبث المباشر بدون تقطيع على جميع الأجهزة.',
  currentAccent: 'cyan',
  features: {
    enableSearch: true,
    enableFavorites: true,
    enableCategoryFilter: true,
    enableAdsSlots: true,
    enableHlsStreaming: true,
  },
  streaming: {
    autoPlay: false, // Respect user preference - no jarring loud autoplay
    streamTimeoutSeconds: 15,
    defaultVolume: 0.85,
  },
  contact: {
    telegram: 'https://t.me/shashtak_live',
    supportEmail: 'support@shashtak.tv',
  },
};
