import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { Hero } from './components/Hero';
import { CategorySection } from './components/CategorySection';
import { FeaturedChannels } from './components/FeaturedChannels';
import { LiveChannels } from './components/LiveChannels';
import { ChannelGrid } from './components/ChannelGrid';
import { SearchBar } from './components/SearchBar';
import { VideoPlayer } from './components/VideoPlayer';
import { FavoritesView } from './components/FavoritesView';
import { Footer } from './components/Footer';
import { AdSlotPlaceholder } from './components/AdSlotPlaceholder';
import { AdminRoadmapModal } from './components/AdminRoadmapModal';
import { ChannelGridSkeleton } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminProtectedArea } from './components/admin/AdminProtectedArea';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Tv, Loader2 } from 'lucide-react';

import { Channel } from './types/channel';
import { Category } from './types/category';
import { channelService } from './services/channelService';
import { categoryService } from './services/categoryService';
import { favoritesService } from './services/favoritesService';
import { APP_CONFIG } from './config/appConfig';

// Helper to extract the application route ('/', '/admin', or '/admin/login')
// dynamically from any URL path or hash, regardless of repository name or domain.
function getAppRoute(pathname: string = window.location.pathname, hash: string = window.location.hash): string {
  // 1. Support hash navigation (e.g., #/admin/login, #/admin, #admin)
  const cleanHash = (hash || '').replace(/^#\/?/, '').replace(/\/$/, '');
  if (cleanHash === 'admin/login') return '/admin/login';
  if (cleanHash === 'admin') return '/admin';

  // 2. Support standard path navigation (e.g., /admin/login, /repo/admin/login, /any/sub/repo/admin/login)
  const cleanPath = (pathname || '').replace(/\/$/, '');
  if (cleanPath.endsWith('/admin/login')) return '/admin/login';
  if (cleanPath.endsWith('/admin')) return '/admin';

  // Default to root home
  return '/';
}

// Extracts the repository or subfolder prefix from the current pathname.
function getBasePrefix(): string {
  const cleanPath = (window.location.pathname || '').replace(/\/$/, '');
  if (cleanPath.endsWith('/admin/login')) {
    return cleanPath.slice(0, -'/admin/login'.length);
  }
  if (cleanPath.endsWith('/admin')) {
    return cleanPath.slice(0, -'/admin'.length);
  }
  return cleanPath;
}

// Constructs the full browser path for history.pushState, prepending current subfolder prefix if any.
function getFullBrowserPath(route: string): string {
  const prefix = getBasePrefix();
  if (route === '/' || route === '') {
    return prefix ? `${prefix}/` : '/';
  }
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  return `${prefix}${cleanRoute}`;
}

function AppContent() {
  const { isAuthenticated, loading: isAuthLoading } = useAuth();

  // Browser Route State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getAppRoute(window.location.pathname, window.location.hash);
  });

  const navigate = useCallback((path: string) => {
    const fullPath = getFullBrowserPath(path);
    if (window.location.pathname !== fullPath) {
      window.history.pushState({}, '', fullPath);
    }
    setCurrentPath(getAppRoute(fullPath));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser forward/back buttons and hash changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getAppRoute(window.location.pathname, window.location.hash));
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Protected Route Guards:
  // 1. Unauthenticated users accessing /admin are automatically redirected to /admin/login
  // 2. Authenticated users accessing /admin/login are redirected to /admin
  useEffect(() => {
    if (isAuthLoading) return;

    if (currentPath === '/admin' && !isAuthenticated) {
      navigate('/admin/login');
    } else if (currentPath === '/admin/login' && isAuthenticated) {
      navigate('/admin');
    }
  }, [currentPath, isAuthenticated, isAuthLoading, navigate]);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'home' | 'channels' | 'favorites' | 'search'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isAdminRoadmapOpen, setIsAdminRoadmapOpen] = useState<boolean>(false);

  // Data States
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Retry handler in case of network or permission errors
  const handleRetry = useCallback(() => {
    setRetryKey((prev) => prev + 1);
  }, []);

  // Connect to Firestore realtime channel stream and load categories
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Load categories
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
    }).catch((err) => {
      console.error('Error loading categories:', err);
    });

    // Subscribe to Firestore 'channels' collection in real-time
    const unsubscribeChannels = channelService.subscribeToChannels(
      (channelsData) => {
        setChannels(channelsData);
        setIsLoading(false);
        setError(null);

        // Keep active selectedChannel in sync if updated in Firestore
        setSelectedChannel((prev) => {
          if (!prev) return null;
          const updated = channelsData.find((c) => c.id === prev.id);
          if (!updated || !updated.isActive) return null;
          return updated;
        });
      },
      (err) => {
        console.error('Realtime Firestore subscription error:', err);
        const msg = err?.message || '';
        if (
          msg.includes('Permission Denied') ||
          msg.includes('permission-denied') ||
          msg.includes('صلاحية للوصول')
        ) {
          setChannels([]);
          setError(null);
        } else {
          setError(msg || 'حدث خطأ أثناء تحميل بيانات القنوات من Firebase.');
        }
        setIsLoading(false);
      }
    );

    // Subscribe to favorites changes
    const unsubscribeFavorites = favoritesService.subscribe((ids) => {
      setFavoriteIds(ids);
    });

    return () => {
      unsubscribeChannels();
      unsubscribeFavorites();
    };
  }, [retryKey]);

  // Handle favorite toggle
  const handleToggleFavorite = (channelId: string) => {
    favoritesService.toggleFavorite(channelId);
  };

  // Clear all favorites
  const handleClearAllFavorites = () => {
    favoritesService.clearFavorites();
  };

  // Category map for fast lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Active channels visible to public visitors
  const publicActiveChannels = useMemo(() => {
    return channels.filter((c) => c.isActive);
  }, [channels]);

  // Counts of channels per category
  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = { all: publicActiveChannels.length };
    publicActiveChannels.forEach((c) => {
      counts[c.categoryId] = (counts[c.categoryId] || 0) + 1;
    });
    return counts;
  }, [publicActiveChannels]);

  // Filtered channels based on category selection
  const categoryFilteredChannels = useMemo(() => {
    if (selectedCategoryId === 'all') return publicActiveChannels;
    return publicActiveChannels.filter((c) => c.categoryId === selectedCategoryId);
  }, [publicActiveChannels, selectedCategoryId]);

  // Search filtered channels
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return publicActiveChannels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (categoryMap.get(c.categoryId)?.name.toLowerCase().includes(q)) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [publicActiveChannels, searchQuery, categoryMap]);

  // Featured channels
  const featuredChannels = useMemo(() => {
    return publicActiveChannels.filter((c) => c.isFeatured);
  }, [publicActiveChannels]);

  // Live channels
  const liveChannels = useMemo(() => {
    return publicActiveChannels;
  }, [publicActiveChannels]);

  // Favorite channels objects
  const favoriteChannels = useMemo(() => {
    return publicActiveChannels.filter((c) => favoriteIds.includes(c.id));
  }, [publicActiveChannels, favoriteIds]);

  // Smooth scroll handler
  const scrollToAllChannels = () => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('all-channels-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const scrollToLiveChannels = () => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('live-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Branded Loading screen while verifying Firebase Auth session for admin routes
  if (isAuthLoading && (currentPath === '/admin' || currentPath === '/admin/login')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] text-white px-4">
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px] shadow-xl shadow-cyan-950/50 mb-4 animate-pulse">
          <div className="w-full h-full rounded-2xl bg-[#090e1a] flex items-center justify-center">
            <Tv className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>جاري التحقق من جلسة الأدمن عبر Firebase Authentication...</span>
        </div>
      </div>
    );
  }

  // Admin Login Route View (/admin/login)
  if (currentPath === '/admin/login') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-cyan-500/25 selection:text-cyan-300">
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => {
            navigate('/');
            setActiveTab(tab);
          }}
          favoritesCount={favoriteIds.length}
          onNavigateAdmin={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
          isAdminAuthenticated={isAuthenticated}
        />
        <main className="flex-1 flex items-center justify-center">
          <AdminLogin
            onSuccessNavigate={() => navigate('/admin')}
            onNavigateHome={() => navigate('/')}
          />
        </main>
        <Footer
          onCategoryClick={(catId) => {
            setSelectedCategoryId(catId);
            setActiveTab('channels');
            navigate('/');
          }}
          onNavigateAdmin={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
        />
      </div>
    );
  }

  // Admin Protected Route View (/admin)
  if (currentPath === '/admin') {
    // If auth state is still initializing, render a clean loading spinner
    if (isAuthLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] text-white px-4">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
          <span className="text-xs text-slate-400">جاري تهيئة جلسة المستخدم...</span>
        </div>
      );
    }

    // If not authenticated, the route guard in useEffect redirects to /admin/login
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] text-white px-4">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
          <span className="text-xs text-slate-400">جاري توجيهك إلى صفحة تسجيل الدخول...</span>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#060a12] text-slate-100 selection:bg-cyan-500/25 selection:text-cyan-300">
        <AdminProtectedArea
          onLogoutNavigate={() => navigate('/admin/login')}
          onNavigateHome={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-cyan-500/25 selection:text-cyan-300">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favoriteIds.length}
        onNavigateAdmin={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
        isAdminAuthenticated={isAuthenticated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {/* Error State */}
        {error && <ErrorState message={error} onRetry={handleRetry} />}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="my-6">
            <ChannelGridSkeleton count={8} />
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && !error && (
          <>
            {/* VIEW 1: HOME */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                {/* Hero Section */}
                <Hero
                  onStartWatching={scrollToAllChannels}
                  onLiveClick={scrollToLiveChannels}
                  featuredChannel={featuredChannels[0] || channels[0] || null}
                  onPlayChannel={(ch) => setSelectedChannel(ch)}
                />

                {/* Categories Bar */}
                <CategorySection
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={(catId) => setSelectedCategoryId(catId)}
                  channelCounts={channelCounts}
                />

                {/* Live Channels section */}
                <LiveChannels
                  channels={liveChannels}
                  categories={categories}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectChannel={(ch) => setSelectedChannel(ch)}
                  onViewAll={scrollToAllChannels}
                />

                {/* Ad Architecture Slot (Non-intrusive preparation for future phase) */}
                <AdSlotPlaceholder placement="home_banner" />

                {/* Featured Channels section */}
                <FeaturedChannels
                  channels={featuredChannels}
                  categories={categories}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectChannel={(ch) => setSelectedChannel(ch)}
                  onViewAll={scrollToAllChannels}
                />

                {/* All Channels Grid with Category Filter */}
                <ChannelGrid
                  channels={categoryFilteredChannels}
                  categories={categories}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectChannel={(ch) => setSelectedChannel(ch)}
                  title={selectedCategoryId === 'all' ? 'جميع القنوات' : `قنوات تصنيف: ${categoryMap.get(selectedCategoryId)?.name || ''}`}
                  selectedCategoryName={selectedCategoryId !== 'all' ? categoryMap.get(selectedCategoryId)?.name : undefined}
                  onResetFilter={() => setSelectedCategoryId('all')}
                />
              </div>
            )}

            {/* VIEW 2: ALL CHANNELS TAB */}
            {activeTab === 'channels' && (
              <div className="space-y-4 my-2">
                <CategorySection
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={(catId) => setSelectedCategoryId(catId)}
                  channelCounts={channelCounts}
                />

                <ChannelGrid
                  channels={categoryFilteredChannels}
                  categories={categories}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectChannel={(ch) => setSelectedChannel(ch)}
                  title={selectedCategoryId === 'all' ? 'دليل كل القنوات الفضائية' : `قنوات: ${categoryMap.get(selectedCategoryId)?.name || ''}`}
                  description="قائمة كاملة بجميع القنوات الفضائية المتاحة للبث الحي"
                  selectedCategoryName={selectedCategoryId !== 'all' ? categoryMap.get(selectedCategoryId)?.name : undefined}
                  onResetFilter={() => setSelectedCategoryId('all')}
                />
              </div>
            )}

            {/* VIEW 3: FAVORITES TAB */}
            {activeTab === 'favorites' && (
              <FavoritesView
                channels={favoriteChannels}
                categories={categories}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                onSelectChannel={(ch) => setSelectedChannel(ch)}
                onClearAllFavorites={handleClearAllFavorites}
                onBrowseChannels={() => setActiveTab('channels')}
              />
            )}

            {/* VIEW 4: SEARCH TAB */}
            {activeTab === 'search' && (
              <div className="my-4">
                <SearchBar
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  resultCount={searchQuery ? searchResults.length : undefined}
                  autoFocus={true}
                />

                {/* Search Results Display */}
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-slate-100">
                          نتائج البحث عن: "{searchQuery}"
                        </h3>
                        <span className="text-xs text-cyan-400 font-mono">
                          {searchResults.length} قنوات مطابقة
                        </span>
                      </div>
                      <ChannelGrid
                        channels={searchResults}
                        categories={categories}
                        favoriteIds={favoriteIds}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectChannel={(ch) => setSelectedChannel(ch)}
                        title="القنوات المطابقة"
                      />
                    </div>
                  ) : (
                    <EmptyState
                      type="search"
                      title={`لم نجد قنوات مطابقة لـ "${searchQuery}"`}
                      description="جرب البحث بكلمات أخرى مثل 'أخبار' أو 'قرآن' أو 'رياضة' أو تصفح القنوات المتاحة."
                      actionText="مسح البحث وعرض كل القنوات"
                      onAction={() => {
                        setSearchQuery('');
                        setActiveTab('channels');
                      }}
                    />
                  )
                ) : channels.length === 0 ? (
                  <div className="mt-8">
                    <EmptyState
                      type="search"
                      title="لا توجد قنوات متاحة حاليًا"
                      description="سيتم إضافة القنوات قريبًا من خلال لوحة الإدارة وقاعدة البيانات لتتمكن من البحث عنها."
                    />
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="text-center py-8">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">
                        اكتب اسم أي قناة أو تصنيف في شريط البحث أعلاه
                      </h3>
                      <p className="text-xs text-slate-400">
                        يدعم البحث الفوري عن القنوات، التصنيفات، والكلمات المفتاحية
                      </p>
                    </div>

                    {/* Popular channels recommendation while search is empty */}
                    <FeaturedChannels
                      channels={featuredChannels}
                      categories={categories}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectChannel={(ch) => setSelectedChannel(ch)}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Video Player Modal / View */}
      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          category={categoryMap.get(selectedChannel.categoryId)}
          channelsList={channels}
          isFavorite={favoriteIds.includes(selectedChannel.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedChannel(null)}
          onSelectChannel={(ch) => setSelectedChannel(ch)}
        />
      )}

      {/* Future Admin & Firebase Roadmap Modal */}
      <AdminRoadmapModal
        isOpen={isAdminRoadmapOpen}
        onClose={() => setIsAdminRoadmapOpen(false)}
      />

      {/* Semantic Footer */}
      <Footer
        onCategoryClick={(catId) => {
          setSelectedCategoryId(catId);
          setActiveTab('channels');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateAdmin={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favoriteIds.length}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
