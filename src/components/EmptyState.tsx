import React from 'react';
import { SearchX, Tv, HeartOff, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'favorites' | 'category' | 'general';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'general',
  title,
  description,
  actionText,
  onAction,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <SearchX className="w-12 h-12 text-cyan-400" />;
      case 'favorites':
        return <HeartOff className="w-12 h-12 text-rose-400" />;
      case 'category':
        return <Tv className="w-12 h-12 text-indigo-400" />;
      default:
        return <Tv className="w-12 h-12 text-slate-400" />;
    }
  };

  const defaultTitle = {
    search: 'لم يتم العثور على أي قناة',
    favorites: 'قائمة المفضلة فارغة حاليًا',
    category: 'لا توجد قنوات متاحة حاليًا',
    general: 'لا توجد قنوات متاحة حاليًا',
  }[type];

  const defaultDesc = {
    search: 'جرب البحث بكلمات مختلفة أو انتظر توفر القنوات في المنصة.',
    favorites: 'يمكنك إضافة قنواتك المفضلة بالضغط على أيقونة القلب لأي قناة لتصل إليها سريعًا هنا.',
    category: 'سيتم إضافة القنوات قريبًا من خلال لوحة الإدارة وقاعدة البيانات.',
    general: 'سيتم إضافة القنوات قريبًا من خلال لوحة الإدارة وقاعدة البيانات.',
  }[type];

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 my-8">
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-5 shadow-inner">
        {getIcon()}
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description || defaultDesc}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-900/30 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
