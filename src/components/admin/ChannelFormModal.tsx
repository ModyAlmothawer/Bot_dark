import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tv, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Layers, 
  FileText, 
  Hash, 
  Sparkles, 
  Radio, 
  AlertCircle, 
  Loader2,
  Check
} from 'lucide-react';
import { Channel, StreamType } from '../../types/channel';
import { CATEGORIES_DATA } from '../../data/categoriesData';

interface ChannelFormModalProps {
  isOpen: boolean;
  channelToEdit: Channel | null;
  onClose: () => void;
  onSave: (channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const ChannelFormModal: React.FC<ChannelFormModalProps> = ({
  isOpen,
  channelToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamType, setStreamType] = useState<StreamType>('hls');
  const [categoryId, setCategoryId] = useState('general');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState<number>(1);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Available selectable categories (excluding 'all')
  const availableCategories = CATEGORIES_DATA.filter((c) => c.id !== 'all');

  // Populate form when editing or opening
  useEffect(() => {
    if (channelToEdit) {
      setName(channelToEdit.name || '');
      setLogo(channelToEdit.logo || '');
      setStreamUrl(channelToEdit.streamUrl || '');
      setStreamType(channelToEdit.streamType || 'hls');
      setCategoryId(channelToEdit.categoryId || 'general');
      setDescription(channelToEdit.description || '');
      setIsActive(channelToEdit.isActive !== undefined ? channelToEdit.isActive : true);
      setIsFeatured(Boolean(channelToEdit.isFeatured));
      setOrder(typeof channelToEdit.order === 'number' ? channelToEdit.order : 1);
    } else {
      setName('');
      setLogo('');
      setStreamUrl('');
      setStreamType('hls');
      setCategoryId('general');
      setDescription('');
      setIsActive(true);
      setIsFeatured(false);
      setOrder(1);
    }
    setValidationError(null);
    setSaveError(null);
    setIsSaving(false);
  }, [channelToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // Prevent double submission

    setValidationError(null);
    setSaveError(null);

    // Validation: name and streamUrl are strictly required
    const trimmedName = name.trim();
    const trimmedUrl = streamUrl.trim();

    if (!trimmedName) {
      setValidationError('يرجى إدخال اسم القناة (حقل إجباري).');
      return;
    }

    if (!trimmedUrl) {
      setValidationError('يرجى إدخال رابط البث المباشر (حقل إجباري).');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        name: trimmedName,
        logo: logo.trim(),
        streamUrl: trimmedUrl,
        streamType,
        categoryId,
        description: description.trim(),
        isActive,
        isFeatured,
        order: Number(order) || 1,
      });
      onClose();
    } catch (err: unknown) {
      console.error('Error saving channel:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg || 'فشل في حفظ القناة في قاعدة البيانات.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div 
        className="bg-[#090f1d] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 transition-all"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#070b14]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {channelToEdit ? 'تعديل بيانات القناة' : 'إضافة قناة فضائية جديدة'}
              </h3>
              <p className="text-xs text-slate-400">
                {channelToEdit ? `المعرف: ${channelToEdit.id}` : 'إدخال القناة وحفظها مباشرة في Firestore'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Validation Alert */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Firestore Error Alert */}
          {saveError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-300">تعذر حفظ القناة في Firestore:</p>
                <p className="leading-relaxed">{saveError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Channel Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>اسم القناة *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: قناة الجزيرة الإخبارية"
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-sm placeholder:text-slate-600 transition-colors"
                required
              />
            </div>

            {/* Stream URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>رابط البث المباشر (Stream URL) *</span>
              </label>
              <input
                type="text"
                dir="ltr"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://example.com/live/stream.m3u8"
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-sm font-mono placeholder:text-slate-600 transition-colors"
                required
              />
              <span className="text-[11px] text-slate-400 block">
                يدعم روابط HLS (.m3u8)، أو روابط MP4 المباشرة، أو روابط التضمين Embed (YouTube/Iframe).
              </span>
            </div>

            {/* Stream Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>نوع البث (Stream Type)</span>
              </label>
              <select
                value={streamType}
                onChange={(e) => setStreamType(e.target.value as StreamType)}
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-sm cursor-pointer transition-colors"
              >
                <option value="hls">HLS (M3U8 / Live Stream)</option>
                <option value="mp4">MP4 (Direct Video File)</option>
                <option value="embed">Embed (YouTube / Iframe)</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>التصنيف (Category)</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-sm cursor-pointer transition-colors"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>رابط شعار القناة (Logo URL)</span>
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  dir="ltr"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-sm font-mono placeholder:text-slate-600 transition-colors"
                />
                {logo ? (
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={logo}
                      alt="معاينة الشعار"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                    <Tv className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>وصف القناة</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="نبذة موجزة عن برامج ومحتوى القناة..."
                disabled={isSaving}
                className="w-full px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-sm placeholder:text-slate-600 transition-colors resize-none"
              />
            </div>

            {/* Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>ترتيب العرض (Order)</span>
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                min={1}
                max={9999}
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-sm transition-colors"
              />
            </div>

            {/* Toggle Status & Featured */}
            <div className="space-y-2 sm:col-span-1 flex flex-col justify-end">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="text-xs font-semibold text-slate-200">مفعلة للبث (Active)</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isSaving}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-3.5 h-3.5 ${isFeatured ? 'text-amber-400' : 'text-slate-600'}`} />
                  <span className="text-xs font-semibold text-slate-200">قناة مميزة (Featured)</span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={isSaving}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري الحفظ في Firestore...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{channelToEdit ? 'حفظ التعديلات' : 'إضافة القناة'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
