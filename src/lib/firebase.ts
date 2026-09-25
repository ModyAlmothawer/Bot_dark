import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase Modular Configuration for Shashtak Platform
 * Project ID: shashtak-tv
 *
 * Single source of truth for Firebase initialization.
 * Reads environment variables configured via Vite (VITE_FIREBASE_*).
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shashtak-tv.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shashtak-tv',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shashtak-tv.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Initialize Firebase App (Singleton instance)
 */
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Initialize Cloud Firestore (Modular SDK)
 */
export const db: Firestore = getFirestore(app);

/**
 * Initialize Firebase Authentication (Modular SDK)
 */
export const auth: Auth = getAuth(app);

/**
 * Helper to determine if Firebase is connected with credentials
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};
