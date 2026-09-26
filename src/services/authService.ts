import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
  Unsubscribe,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Formats Firebase Auth errors into clear, friendly Arabic messages
 */
export function formatAuthError(error: unknown): string {
  if (!error) return 'حدث خطأ غير متوقع أثناء المصادقة.';

  const err = error as { code?: string; message?: string };
  const code = err?.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'بيانات تسجيل الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صالحة.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب من قِبل إدارة النظام.';
    case 'auth/too-many-requests':
      return 'تم حظر الدخول مؤقتًا لكثرة المحاولات الخاطئة. يرجى المحاولة بعد قليل.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بخادم Firebase، يرجى التحقق من اتصال الإنترنت.';
    case 'auth/operation-not-allowed':
      return 'تسجيل الدخول عبر البريد الإلكتروني غير مفعّل في لوحة Firebase.';
    default:
      return err?.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
  }
}

export interface IAuthService {
  signInWithEmailAndPassword(email: string, pass: string): Promise<UserCredential>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
  getCurrentUser(): User | null;
}

/**
 * AuthService
 * Centralized Firebase Authentication Modular Service for Shashtak Platform.
 * Firebase Authentication is the sole authoritative source of truth.
 */
export class AuthService implements IAuthService {
  /**
   * Authenticate admin using Firebase Auth Email & Password
   */
  async signInWithEmailAndPassword(email: string, pass: string): Promise<UserCredential> {
    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) {
      throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      return userCredential;
    } catch (error) {
      console.error('Firebase Auth signIn error:', error);
      const friendlyMessage = formatAuthError(error);
      throw new Error(friendlyMessage);
    }
  }

  /**
   * Terminate Firebase Auth session
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Firebase Auth signOut error:', error);
      throw new Error(formatAuthError(error));
    }
  }

  /**
   * Realtime observer for Firebase Auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return firebaseOnAuthStateChanged(
      auth,
      (user) => {
        callback(user);
      },
      (error) => {
        console.error('Firebase Auth state change error:', error);
        callback(null);
      }
    );
  }

  /**
   * Synchronously retrieve current authenticated user from Firebase Auth
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
}

// Export singleton instance of AuthService
export const authService: IAuthService = new AuthService();
