import React, { useState } from 'react';
import { 
  Tv, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onSuccessNavigate: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccessNavigate,
  onNavigateHome,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(cleanEmail, password);
      // On success, navigate to /admin
      onSuccessNavigate();
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الدخول. يرجى التأكد من البيانات.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900/60"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للموقع الرئيسي</span>
          </button>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            Firebase Auth v12
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-[#090f1d] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex flex-col items-center text-center mb-8 relative">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px] shadow-xl shadow-cyan-950/50 mb-4">
              <div className="w-full h-full rounded-2xl bg-[#090e1a] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              تسجيل دخول الإدارة
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs">
              منصة شاشتك فـ جيبك • الدخول مخصص لمسؤولي النظام فقط عبر Firebase Authentication
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="admin-email"
                className="block text-xs font-bold text-slate-300 mb-1.5 text-right"
              >
                البريد الإلكتروني للأدمن
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shashtak.tv"
                  disabled={isSubmitting}
                  className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-300 mb-1.5 text-right"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/40 hover:shadow-cyan-900/60 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق والمصادقة...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول لوحة الإدارة</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              المصادقة مؤمنة بالكامل عبر Firebase Authentication. لا يتم حفظ كلمات المرور محليًا في المتصفح.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
