import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  Layers, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Sparkles, 
  Radio, 
  Eye, 
  EyeOff, 
  Menu, 
  X, 
  RefreshCw,
  Loader2,
  Trophy,
  Newspaper,
  BookOpen,
  Film,
  Baby,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService, AdminStatusResult } from '../../services/adminService';
import { channelService } from '../../services/channelService';
import { categoryService } from '../../services/categoryService';
import { Channel } from '../../types/channel';
import { Category } from '../../types/category';
import { ChannelFormModal } from './ChannelFormModal';
import { DeleteChannelModal } from './DeleteChannelModal';
import { CATEGORIES_DATA } from '../../data/categoriesData';

interface AdminProtectedAreaProps {
  onLogoutNavigate: () => void;
  onNavigateHome: () => void;
}

type AdminSection = 'overview' | 'channels' | 'categories' | 'settings';

export const AdminProtectedArea: React.FC<AdminProtectedAreaProps> = ({
  onLogoutNavigate,
  onNavigateHome,
}) => {
  const { user, uid, adminStatus, isAdminLoading, refreshAdminStatus, logout } = useAuth();

  // Navigation State
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const [isCopiedUid, setIsCopiedUid] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [isCopiedRules, setIsCopiedRules] = useState<boolean>(false);
  const [isCopiedFullRules, setIsCopiedFullRules] = useState<boolean>(false);

  const handleCopyAdminRule = () => {
    const rulesSnippet = `match /admins/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false;
}`;
    navigator.clipboard.writeText(rulesSnippet);
    setIsCopiedRules(true);
    setTimeout(() => setIsCopiedRules(false), 2000);
  };

  const handleCopyFullRules = () => {
    const fullRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    match /channels/{channelId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /admins/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow write: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;
    navigator.clipboard.writeText(fullRules);
    setIsCopiedFullRules(true);
    setTimeout(() => setIsCopiedFullRules(false), 2000);
  };

  // Channels Real-time State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);

  // Modals & Action States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [channelToEdit, setChannelToEdit] = useState<Channel | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [togglingChannelId, setTogglingChannelId] = useState<string | null>(null);

  // Channel Table Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');

  // Show auto-dismiss notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Load Categories
  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
    }).catch((err) => {
      console.error('Error loading categories:', err);
    });
  }, []);

  // Real-time Firestore Channels Subscription
  useEffect(() => {
    setIsLoadingChannels(true);
    setChannelsError(null);

    const unsubscribe = channelService.subscribeToChannels(
      (channelsData) => {
        setChannels(channelsData);
        setIsLoadingChannels(false);
        setChannelsError(null);
      },
      (error) => {
        console.error('Admin channels subscription error:', error);
        setChannelsError(error.message || 'تعذر جلب بيانات القنوات من Firestore.');
        setIsLoadingChannels(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      onLogoutNavigate();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Handle Copy UID
  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setIsCopiedUid(true);
      setTimeout(() => setIsCopiedUid(false), 2000);
    }
  };

  // Handle Toggle Active Status
  const handleToggleActive = async (channel: Channel) => {
    try {
      setTogglingChannelId(channel.id);
      const newStatus = !channel.isActive;
      await channelService.toggleChannelStatus(channel.id, newStatus);
      showNotification('success', `تم ${newStatus ? 'تفعيل' : 'إيقاف'} قناة "${channel.name}" بنجاح.`);
    } catch (err: unknown) {
      console.error('Error toggling channel active status:', err);
      const msg = err instanceof Error ? err.message : String(err);
      showNotification('error', `فشل في تغيير حالة القناة: ${msg}`);
    } finally {
      setTogglingChannelId(null);
    }
  };

  // Handle Toggle Featured Status
  const handleToggleFeatured = async (channel: Channel) => {
    try {
      setTogglingChannelId(channel.id);
      const newStatus = !channel.isFeatured;
      await channelService.toggleFeaturedStatus(channel.id, newStatus);
      showNotification('success', `تم ${newStatus ? 'تمييز' : 'إلغاء تمييز'} قناة "${channel.name}" بنجاح.`);
    } catch (err: unknown) {
      console.error('Error toggling channel featured status:', err);
      const msg = err instanceof Error ? err.message : String(err);
      showNotification('error', `فشل في تغيير تمييز القناة: ${msg}`);
    } finally {
      setTogglingChannelId(null);
    }
  };

  // Handle Save (Create or Update) Channel
  const handleSaveChannel = async (channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (channelToEdit) {
      // Update
      await channelService.updateChannel(channelToEdit.id, channelData);
      showNotification('success', `تم تحديث بيانات قناة "${channelData.name}" بنجاح.`);
    } else {
      // Create
      await channelService.createChannel(channelData);
      showNotification('success', `تمت إضافة قناة "${channelData.name}" بنجاح في Firestore.`);
    }
    // Re-check admin status if it succeeded (confirms write permission)
    if (adminStatus && !adminStatus.isAdmin) {
      await refreshAdminStatus();
    }
  };

  // Handle Delete Channel
  const handleConfirmDeleteChannel = async (channelId: string) => {
    await channelService.deleteChannel(channelId);
    showNotification('success', 'تم حذف القناة نهائيًا من Firestore.');
  };

  // Filtered Channels for Table
  const filteredChannels = useMemo(() => {
    let result = [...channels];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.streamUrl.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      result = result.filter((c) => c.categoryId === selectedCategoryFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((c) => c.isActive);
    } else if (statusFilter === 'inactive') {
      result = result.filter((c) => !c.isActive);
    } else if (statusFilter === 'featured') {
      result = result.filter((c) => c.isFeatured);
    }

    return result;
  }, [channels, searchQuery, selectedCategoryFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = channels.length;
    const active = channels.filter((c) => c.isActive).length;
    const inactive = total - active;
    const featured = channels.filter((c) => c.isFeatured).length;
    return { total, active, inactive, featured };
  }, [channels]);

  // Fast Category Name Resolver
  const getCategoryName = (catId: string) => {
    const cat = CATEGORIES_DATA.find((c) => c.id === catId);
    return cat ? cat.name : catId;
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col md:flex-row" dir="rtl">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#090f1d] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Tv className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white">لوحة تحكم شاشتك</span>
        </div>

        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="القائمة"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:static inset-y-0 right-0 z-40 w-64 bg-[#080d19] border-l border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${isMobileNavOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-5">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800/80 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px] shadow-lg shadow-cyan-950/50 shrink-0">
              <div className="w-full h-full rounded-2xl bg-[#090e1a] flex items-center justify-center">
                <Tv className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Shashtak Admin
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono block">
                Firestore Realtime CRUD
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveSection('overview');
                setIsMobileNavOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>نظرة عامة (Overview)</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('channels');
                setIsMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'channels'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4" />
                <span>إدارة القنوات (Channels)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                {channels.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSection('categories');
                setIsMobileNavOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'categories'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>التصنيفات (Categories)</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('settings');
                setIsMobileNavOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'settings'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>الإعدادات (Settings)</span>
            </button>
          </nav>
        </div>

        {/* User Account & Bottom Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070b14]/50 space-y-3">
          {/* Admin User Badge */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400">حساب المسؤول</span>
              {isAdminLoading ? (
                <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  جاري الفحص...
                </span>
              ) : adminStatus?.isAdmin ? (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  مصرح
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  غير مصرح
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-white truncate" dir="ltr">
              {user?.email}
            </p>
          </div>

          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>عرض الموقع كزائر</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-white border border-rose-800/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Floating Notification Toast */}
        {notification && (
          <div 
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80 shadow-emerald-950/50'
                : 'bg-rose-950/90 text-rose-200 border-rose-800/80 shadow-rose-950/50'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  لوحة التحكم الرئيسية
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  إدارة محتوى القنوات الفضائية وحالة الاتصال بقاعدة بيانات Firestore المباشرة
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setChannelToEdit(null);
                    setIsFormModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قناة جديدة</span>
                </button>
              </div>
            </div>

            {/* Admin Security Authorization Status Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#091122] to-[#070b14] border border-cyan-900/40 relative overflow-hidden shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        حالة تفويض الإدارة (Admin Authorization System)
                      </h3>
                      {isAdminLoading ? (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                          جاري الفحص المباشر مع الخادم...
                        </span>
                      ) : adminStatus?.isAdmin ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          صلاحية الأدمن مفعلة ({adminStatus.method === 'custom_claim' ? 'Custom Claim' : `/admins/${adminStatus.details?.docId || uid || user?.uid}`})
                        </span>
                      ) : adminStatus?.diagnostics?.errorCode === 'permission-denied' ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          خطأ أذونات: permission-denied (حظر من قواعد Firestore)
                        </span>
                      ) : adminStatus?.diagnostics?.errorCode ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          خطأ: {adminStatus.diagnostics.errorCode}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          بانتظار مطابقة مستند /admins/{uid || user?.uid}
                        </span>
                      )}

                      <button
                        onClick={() => refreshAdminStatus()}
                        disabled={isAdminLoading}
                        className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                        title="إعادة فحص الصلاحية فورياً من الخادم"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAdminLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={() => setShowDiagnostics(!showDiagnostics)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        {showDiagnostics ? 'إخفاء الفحص الفني' : 'عرض الفحص الفني (Diagnostics)'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      تعتمد منصة شاشتك على نظام Zero-Trust للأمان عبر <span className="font-mono text-cyan-400">firestore.rules</span>؛ يتطلب تفويض المشرف مستنداً بالمسار <span className="font-mono text-cyan-300">/admins/{uid || user?.uid}</span>.
                    </p>
                  </div>
                </div>

                {/* User UID Copy Box */}
                <div className="w-full md:w-auto bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-500 block">معرف حسابك (Auth UID)</span>
                    <span className="text-xs font-mono text-cyan-300 select-all" dir="ltr">
                      {uid || user?.uid}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyUid}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                    title="نسخ المعرف"
                  >
                    {isCopiedUid ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Specific Reason Alert: Permission Denied */}
              {!isAdminLoading && !adminStatus?.isAdmin && adminStatus?.diagnostics?.errorCode === 'permission-denied' && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-rose-200 bg-rose-950/30 p-4 rounded-2xl border border-rose-900/40 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>تم رفض الإذن بواسطة قواعد الأمان (Firestore Permission Denied)</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    حاول التطبيق قراءة المستند <span className="font-mono text-cyan-300">admins/{uid || user?.uid}</span>، ولكن قواعد الأمان المطبقة حالياً في <span className="font-mono text-amber-300">Firebase Console</span> رفضت القراءة (رمز الخطأ: <span className="font-mono text-rose-300 font-bold">permission-denied</span>).
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    لحل المشكلة وتفعيل الصلاحية فوراً: توجه إلى <span className="font-mono text-cyan-300">Firebase Console &gt; Firestore Database &gt; Rules</span> وتأكد من نشر القاعدة التالية ثم اضغط <strong>Publish</strong>:
                  </p>
                  <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] text-cyan-300" dir="ltr">
                    <code className="text-xs text-cyan-200 break-all">{`match /admins/{userId} { allow read: if request.auth != null && request.auth.uid == userId; allow write: if false; }`}</code>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-sans">
                      <button
                        onClick={handleCopyAdminRule}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-colors cursor-pointer"
                      >
                        {isCopiedRules ? 'تم نسخ القاعدة' : 'نسخ قاعدة الأدمن'}
                      </button>
                      <button
                        onClick={handleCopyFullRules}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 text-xs transition-colors cursor-pointer"
                      >
                        {isCopiedFullRules ? 'تم نسخ القواعد كاملة' : 'نسخ ملف firestore.rules كاملاً'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Reason Alert: Document Missing (exists() == false) */}
              {!isAdminLoading && !adminStatus?.isAdmin && adminStatus?.diagnostics?.docExists === false && !adminStatus?.diagnostics?.errorCode && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-amber-200/90 bg-amber-950/20 p-4 rounded-2xl border border-amber-900/30 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-amber-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span>المستند غير موجود في Firestore (exists() = false)</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    استجاب خادم Firestore بنجاح وبدون أخطاء، ولكن لم يتم العثور على أي مستند بالمسار: <span className="font-mono text-cyan-300 select-all font-bold">admins/{uid || user?.uid}</span> في مشروع <span className="font-mono text-white">shashtak-tv</span>.
                  </p>
                  <div className="text-slate-300 space-y-1">
                    <p className="font-bold text-amber-300">يُرجى مراجعة النقاط الثلاث في Firebase Console:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                      <li>اسم المجموعة: <span className="font-mono text-amber-300">admins</span> (أحرف صغيرة تماماً lowercase).</li>
                      <li>معرّف المستند (Document ID): أن يكون هو الـ <span className="font-mono text-cyan-300">{uid || user?.uid}</span> ذاته، وليس كحقل داخلي (Field).</li>
                      <li>تأكد من عدم وجود مسافات بيضاء إضافية قبل أو بعد المعرف في Firebase Console.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Live Diagnostic Inspector Drawer / Panel */}
              {showDiagnostics && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-xs space-y-3 font-mono">
                  <div className="flex items-center justify-between text-cyan-400 font-bold font-sans">
                    <span>نتائج الفحص الفني في الوقت الفعلي (Live Runtime Diagnostics)</span>
                    <button
                      onClick={() => refreshAdminStatus()}
                      disabled={isAdminLoading}
                      className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                    >
                      إعادة الفحص الآن (Server Query)
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]" dir="ltr">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Firebase Project ID:</span>
                      <span className="text-emerald-400 font-bold">{adminStatus?.diagnostics?.projectId || 'shashtak-tv'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Firebase App Name:</span>
                      <span className="text-slate-300">{adminStatus?.diagnostics?.firebaseAppName || '[DEFAULT]'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Current User UID:</span>
                      <span className="text-cyan-300 select-all">{adminStatus?.diagnostics?.authUid || uid || user?.uid}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Current User Email:</span>
                      <span className="text-slate-300">{adminStatus?.diagnostics?.authEmail || user?.email || 'N/A'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Requested Document Path:</span>
                      <span className="text-amber-300">{adminStatus?.diagnostics?.documentPath || `admins/${uid || user?.uid}`}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Firestore Read Executed:</span>
                      <span className={adminStatus?.diagnostics?.readExecuted ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {adminStatus?.diagnostics?.readExecuted ? 'true' : 'false'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Document Exists (doc.exists()):</span>
                      <span className={adminStatus?.diagnostics?.docExists === true ? 'text-emerald-400 font-bold' : adminStatus?.diagnostics?.docExists === false ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {String(adminStatus?.diagnostics?.docExists)}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Error Code:</span>
                      <span className={adminStatus?.diagnostics?.errorCode ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {adminStatus?.diagnostics?.errorCode || 'None (Success)'}
                      </span>
                    </div>
                  </div>
                  {adminStatus?.diagnostics?.errorMessage && (
                    <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 text-[11px]" dir="ltr">
                      <span className="font-bold text-rose-400 block mb-1">Error Message:</span>
                      {adminStatus.diagnostics.errorMessage}
                    </div>
                  )}
                  {adminStatus?.diagnostics?.docData && (
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px]" dir="ltr">
                      <span className="text-slate-400 block mb-1 font-sans">Document Snapshot Data:</span>
                      <pre className="text-cyan-300 whitespace-pre-wrap">{JSON.stringify(adminStatus.diagnostics.docData, null, 2)}</pre>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 text-left" dir="ltr">
                    Checked At: {adminStatus?.diagnostics?.checkedAt || 'N/A'} (Bypassed Cache: {String(adminStatus?.diagnostics?.cacheBypassed ?? true)})
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#090f1d] border border-slate-800/80 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">إجمالي القنوات</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                    <Tv className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.total}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  مخزنة في Firestore
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#090f1d] border border-slate-800/80 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">القنوات المفعلة</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {stats.active}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  معروضة للزوار للبث
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#090f1d] border border-slate-800/80 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">القنوات المعطلة</span>
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-400">
                    <EyeOff className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-300 font-mono">
                  {stats.inactive}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  مخفية مؤقتًا من البث
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#090f1d] border border-slate-800/80 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">القنوات المميزة</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {stats.featured}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  تظهر في الواجهة الأولى
                </span>
              </div>
            </div>

            {/* Quick Actions & Recent Channels Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Links Card */}
              <div className="p-5 rounded-3xl bg-[#090f1d] border border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>إجراءات سريعة</span>
                </h3>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setChannelToEdit(null);
                      setIsFormModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-cyan-400" />
                      <span>إضافة قناة جديدة</span>
                    </span>
                    <span className="text-slate-500">→</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('channels')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-cyan-400" />
                      <span>تصفح وتعديل قائمة القنوات</span>
                    </span>
                    <span className="text-slate-500">→</span>
                  </button>

                  <button
                    onClick={onNavigateHome}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      <span>الذهاب للموقع وتجربة البث الحي</span>
                    </span>
                    <span className="text-slate-500">→</span>
                  </button>
                </div>
              </div>

              {/* Real-time Summary Card */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-[#090f1d] border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>آخر القنوات المحدثة</span>
                  </h3>
                  <button
                    onClick={() => setActiveSection('channels')}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    عرض الكل ({channels.length})
                  </button>
                </div>

                {isLoadingChannels ? (
                  <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="text-xs">جاري الاتصال بـ Firestore...</span>
                  </div>
                ) : channels.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/60">
                    <Tv className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 mb-3">
                      قاعدة بيانات Firestore فارغة حالياً. لا توجد أي قنوات مضافة.
                    </p>
                    <button
                      onClick={() => {
                        setChannelToEdit(null);
                        setIsFormModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>أضف أول قناة الآن</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {channels.slice(0, 4).map((ch) => (
                      <div key={ch.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {ch.logo ? (
                            <img
                              src={ch.logo}
                              alt={ch.name}
                              className="w-8 h-8 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">
                              {ch.name.slice(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {getCategoryName(ch.categoryId)} • {ch.streamType.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ch.isFeatured && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
                              مميزة
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              ch.isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {ch.isActive ? 'مفعلة' : 'معطلة'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: CHANNELS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeSection === 'channels' && (
          <div className="space-y-6">
            {/* Header with Title and Add Channel Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <span>إدارة القنوات الفضائية</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                    {channels.length}
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  إضافة، تعديل، حذف، وتفعيل القنوات في Firestore لحظيًا مع التحديث التلقائي لكافة الزوار
                </p>
              </div>

              <button
                onClick={() => {
                  setChannelToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قناة جديدة</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#090f1d] border border-slate-800/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 shadow-lg">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث باسم القناة أو الوصف أو الرابط..."
                  className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs placeholder:text-slate-600 transition-colors"
                />
              </div>

              {/* Category dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs cursor-pointer transition-colors"
                >
                  <option value="all">كافة التصنيفات</option>
                  {CATEGORIES_DATA.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'featured')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs cursor-pointer transition-colors"
                >
                  <option value="all">كافة الحالات</option>
                  <option value="active">المفعلة فقط (Active)</option>
                  <option value="inactive">المعطلة فقط (Inactive)</option>
                  <option value="featured">المميزة فقط (Featured)</option>
                </select>
              </div>
            </div>

            {/* Channels Table / List */}
            {isLoadingChannels ? (
              <div className="p-16 flex flex-col items-center justify-center bg-[#090f1d] border border-slate-800/80 rounded-3xl text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="text-xs">جاري تحميل القنوات من Firestore...</span>
              </div>
            ) : channelsError ? (
              <div className="p-8 bg-rose-950/20 border border-rose-900/40 rounded-3xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="text-sm font-bold text-rose-300">تعذر تحميل القنوات</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">{channelsError}</p>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="p-16 text-center bg-[#090f1d] border border-slate-800/80 rounded-3xl space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <Tv className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {channels.length === 0 ? 'لا توجد أي قنوات مضافة في Firestore' : 'لا توجد نتائج مطابقة للبحث'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {channels.length === 0
                    ? 'قاعدة البيانات فارغة حالياً. يمكنك الآن الضغط على زر إضافة قناة لحفظ أول قناة فضائية في Firestore.'
                    : 'جرّب تعديل مصطلحات البحث أو اختيار تصنيف آخر.'}
                </p>
                {channels.length === 0 && (
                  <button
                    onClick={() => {
                      setChannelToEdit(null);
                      setIsFormModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة أول قناة الآن</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#090f1d] border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-[#070b14]/70 text-slate-400 font-semibold">
                        <th className="py-3.5 px-4">القناة</th>
                        <th className="py-3.5 px-4">التصنيف</th>
                        <th className="py-3.5 px-4">نوع البث</th>
                        <th className="py-3.5 px-4">الترتيب</th>
                        <th className="py-3.5 px-4 text-center">مفعلة (Active)</th>
                        <th className="py-3.5 px-4 text-center">مميزة (Featured)</th>
                        <th className="py-3.5 px-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredChannels.map((channel) => (
                        <tr
                          key={channel.id}
                          className="hover:bg-slate-900/40 transition-colors"
                        >
                          {/* Channel Logo + Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {channel.logo ? (
                                <img
                                  src={channel.logo}
                                  alt={channel.name}
                                  className="w-9 h-9 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                                  {channel.name.slice(0, 2)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate">
                                  {channel.name}
                                </span>
                                {channel.description && (
                                  <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                    {channel.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                              {getCategoryName(channel.categoryId)}
                            </span>
                          </td>

                          {/* Stream Type */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 uppercase">
                              {channel.streamType}
                            </span>
                          </td>

                          {/* Order */}
                          <td className="py-3.5 px-4 font-mono text-slate-300 font-bold">
                            #{channel.order ?? 1}
                          </td>

                          {/* Toggle Active */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleActive(channel)}
                              disabled={togglingChannelId === channel.id}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                channel.isActive
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                              } disabled:opacity-50`}
                            >
                              {togglingChannelId === channel.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : channel.isActive ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                              <span>{channel.isActive ? 'مفعلة' : 'معطلة'}</span>
                            </button>
                          </td>

                          {/* Toggle Featured */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(channel)}
                              disabled={togglingChannelId === channel.id}
                              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                channel.isFeatured
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 hover:text-slate-400'
                              } disabled:opacity-50`}
                              title={channel.isFeatured ? 'إلغاء التمييز' : 'تمييز القناة'}
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setChannelToEdit(channel);
                                  setIsFormModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                                title="تعديل بيانات القناة"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setChannelToDelete(channel);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/50 transition-colors cursor-pointer"
                                title="حذف القناة من Firestore"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Count Bar */}
                <div className="p-4 border-t border-slate-800/80 bg-[#070b14]/50 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    عرض {filteredChannels.length} من أصل {channels.length} قناة
                  </span>
                  <span className="font-mono text-cyan-400 text-[11px]">
                    Firestore Realtime Synced
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: CATEGORIES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeSection === 'categories' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <span>إدارة تصنيفات المنصة</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                  {CATEGORIES_DATA.filter((c) => c.id !== 'all').length}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                استعراض التصنيفات المعتمدة وعدد القنوات المرتبطة بكل تصنيف
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES_DATA.filter((c) => c.id !== 'all').map((category) => {
                const count = channels.filter((c) => c.categoryId === category.id).length;

                return (
                  <div
                    key={category.id}
                    className="p-5 rounded-3xl bg-[#090f1d] border border-slate-800/80 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                        {count} قناة
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{category.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>ID: {category.id}</span>
                      <span>Order: #{category.order}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: SETTINGS PLACEHOLDER */}
        {/* ========================================================================= */}
        {activeSection === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                إعدادات المنصة (Settings)
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                تخصيص الإعدادات العامة للبث وإعلانات المنصة وقواعد التخزين المؤقت
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#090f1d] border border-slate-800/80 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-2">
                <SettingsIcon className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-white">
                المرحلة القادمة: لوحة التحكم المتقدمة للإعدادات
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                تم تجهيز هيكل الإعدادات ليتضمن في التحديثات القادمة:
              </p>

              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                <li>إدارة مساحات الإعلانات الشاغرة ومفاتيح AdSense / VAST.</li>
                <li>تحديد الجودة الافتراضية للبث (Auto / HD / SD).</li>
                <li>تفعيل أو تعطيل وضع الصيانة للموقع.</li>
                <li>إدارة صلاحيات مسؤولي الأدمن الفرعيين.</li>
              </ul>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                الحالة: قيد الجدولة للمراحل القادمة.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ChannelFormModal
        isOpen={isFormModalOpen}
        channelToEdit={channelToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setChannelToEdit(null);
        }}
        onSave={handleSaveChannel}
      />

      <DeleteChannelModal
        isOpen={isDeleteModalOpen}
        channel={channelToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setChannelToDelete(null);
        }}
        onConfirmDelete={handleConfirmDeleteChannel}
      />
    </div>
  );
};
