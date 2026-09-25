import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { Channel } from '../../types/channel';

interface DeleteChannelModalProps {
  isOpen: boolean;
  channel: Channel | null;
  onClose: () => void;
  onConfirmDelete: (channelId: string) => Promise<void>;
}

export const DeleteChannelModal: React.FC<DeleteChannelModalProps> = ({
  isOpen,
  channel,
  onClose,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isOpen || !channel) return null;

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await onConfirmDelete(channel.id);
      onClose();
    } catch (err: unknown) {
      console.error('Error deleting channel:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError(msg || 'فشل في حذف القناة من قاعدة البيانات.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div 
        className="bg-[#090f1d] border border-rose-900/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-all"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-rose-950/20">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>تأكيد حذف القناة</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف هذه القناة نهائيًا من قاعدة بيانات <span className="font-mono text-cyan-400 font-bold">Firestore</span>؟
          </p>

          {/* Channel Preview Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 font-bold border border-slate-800">
                {channel.name.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{channel.name}</h4>
              <p className="text-xs text-slate-400 truncate font-mono" dir="ltr">
                ID: {channel.id}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-rose-300/80 bg-rose-950/30 p-2.5 rounded-xl border border-rose-900/30">
            تنبيه: سيتم إزالة هذه القناة فورًا من البث المباشر وسيتوقف ظهورها لكافة الزوار.
          </div>

          {/* Error alert */}
          {deleteError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 flex items-start gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#070b14]/50 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            تراجع
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، احذف القناة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
