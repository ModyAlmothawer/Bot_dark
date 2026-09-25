import React from 'react';
import { ShieldCheck, Database, Key, Radio, Layers, CheckCircle2, X } from 'lucide-react';

interface AdminRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminRoadmapModal: React.FC<AdminRoadmapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                خارطة طريق لوحة التحكم وFirebase
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                /admin & Firebase Backend Roadmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <p className="text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            تم بناء هندسة هذا المشروع بالكامل بنمط <span className="text-cyan-400 font-semibold">Clean Architecture & Service Repository</span> لكي يتم ربط Firebase و/admin في المرحلة القادمة بسلاسة دون الحاجة لإعادة كتابة كود الواجهة.
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-200 text-xs sm:text-sm">
                  1. Firebase Authentication
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  تسجيل دخول المسؤولين (Admin & Editors) والمستخدمين وحفظ المفضلات سحابيًا.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-200 text-xs sm:text-sm">
                  2. Cloud Firestore Database
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  قواعد بيانات حية لمجموعات القنوات (Channels) والتصنيفات (Categories) والإعلانات (Ads).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <Radio className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-200 text-xs sm:text-sm">
                  3. لوحة تحكم الإدارة الكاملة (/admin)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  إضافة قنوات جديدة، تحديث روابط M3U8، تفعيل/تعطيل البث، رفع الشعارات، وإدارة الإعلانات.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>الهندسة التحتية جاهزة 100%</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            حسنًا، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
