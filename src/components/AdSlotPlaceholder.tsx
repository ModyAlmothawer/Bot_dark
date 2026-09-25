import React from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import { AdPlacement } from '../types/ads';

interface AdSlotPlaceholderProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * AdSlotPlaceholder
 * Prepares the layout architecture for future Firebase/AdSense ads
 * without disrupting the clean dark UI experience today.
 */
export const AdSlotPlaceholder: React.FC<AdSlotPlaceholderProps> = ({
  placement,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center my-4 overflow-hidden relative ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="inline-flex items-center gap-1">
          <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>مساحة إعلانية مخصصة</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400 uppercase">
          [{placement}]
        </span>
      </div>
      <div className="py-2 flex flex-col items-center justify-center">
        <p className="text-xs text-slate-300 font-medium">
          هنا تظهر الإعلانات أو العروض الترويجية مستقبلاً من خلال لوحة التحكم
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          مجهزة بالكامل للربط مع Firebase Firestore وGoogle AdSense
        </p>
      </div>
    </div>
  );
};
