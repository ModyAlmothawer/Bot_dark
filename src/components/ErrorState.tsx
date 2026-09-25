import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'حدث خطأ غير متوقع',
  message = 'تعذر تحميل البيانات المطلوبة، يرجى التحقق من اتصالك بالإنترنت والمحاولة مجددًا.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-rose-950/20 border border-rose-900/40 my-6">
      <div className="p-3 rounded-xl bg-rose-900/30 text-rose-400 mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-slate-200 mb-2">{title}</h4>
      <p className="text-sm text-slate-400 max-w-md mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm transition-colors border border-slate-700 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>
      )}
    </div>
  );
};
