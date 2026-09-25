import React from 'react';
import { Tv, Heart, Radio, Shield, Send, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface FooterProps {
  onCategoryClick?: (categoryId: string) => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateAdmin }) => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-[#050810]/80 backdrop-blur-xl text-slate-400 text-xs pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform Overview */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white">
                <Tv className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">
                {APP_CONFIG.appName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              منصة عربية مستقلة لمشاهدة البث المباشر للقنوات الفضائية العربية والعالمية المجانية بجودة عالية. مصممة لتكون خفيفة، سريعة، ومتاحة دائمًا في جيبك.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-cyan-400">
                <Radio className="w-3 h-3 animate-live" />
                <span>بثوث حية 24/7</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">
                <Shield className="w-3 h-3" />
                <span>خالٍ من التعقيد</span>
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-sm">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#live-section" className="hover:text-cyan-400 transition-colors">
                  البث المباشر الآن
                </a>
              </li>
              <li>
                <a href="#all-channels-section" className="hover:text-cyan-400 transition-colors">
                  تصفح جميع القنوات
                </a>
              </li>
              <li>
                <button
                  onClick={onNavigateAdmin}
                  className="hover:text-cyan-400 transition-colors text-right cursor-pointer"
                >
                  بوابة إدارة المنصة (/admin)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Technology */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-sm">الهندسة البرمجية</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تم بناء المنصة باستخدام React 19، Vite، HLS.js للبث الحي، مع تجهيز طبقة Firebase Modular (Firestore و Auth) بالكامل.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                Firebase v12 Modular
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p dir="ltr" className="font-mono text-slate-400 select-none tracking-wide">
            © 2026 Shashtak — Developed by Mr. Dark
          </p>
          <p className="text-slate-400">
            جميع القنوات والبثوث المعروضة هي إشارات مجانية حرة متاحة علنًا عبر شبكة الإنترنت.
          </p>
        </div>
      </div>
    </footer>
  );
};
