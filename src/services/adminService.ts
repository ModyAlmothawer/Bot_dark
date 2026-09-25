import {
  doc,
  getDoc,
  getDocFromServer,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth, firebaseConfig } from '../lib/firebase';

export interface AdminDiagnosticInfo {
  checkedAt: string;
  projectId: string;
  firebaseAppName: string;
  authUid: string;
  authEmail: string | null;
  documentPath: string;
  readExecuted: boolean;
  docExists: boolean | null;
  docData: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  rawError: string | null;
  customClaimFound: boolean;
  tokenClaims?: Record<string, unknown>;
  cacheBypassed?: boolean;
}

export interface AdminStatusResult {
  isAdmin: boolean;
  method?: 'custom_claim' | 'firestore_doc' | 'none';
  details?: {
    role?: string;
    email?: string;
    grantedAt?: string;
    docId?: string;
  };
  diagnostics?: AdminDiagnosticInfo;
}

/**
 * Admin Service
 * Handles zero-trust authorization verification for Admin users.
 * Verifies that the authenticated Firebase Auth user is granted Admin privileges
 * either via token custom claims (admin: true) or an authorized record in the /admins/{uid} collection.
 */
export class AdminService {
  /**
   * Checks whether the current user has verified admin privileges.
   * Directly queries Firestore `/admins/{uid}` with cache-bypassing server query
   * and preserves all diagnostic error codes/messages.
   */
  async checkAdminStatus(user?: User | null): Promise<AdminStatusResult> {
    const targetUser = user || auth.currentUser;
    const resolvedProjectId = db.app.options.projectId || firebaseConfig.projectId || 'shashtak-tv';

    if (!targetUser) {
      console.warn('[AdminService] No authenticated user found for admin check.');
      return {
        isAdmin: false,
        method: 'none',
        diagnostics: {
          checkedAt: new Date().toISOString(),
          projectId: resolvedProjectId,
          firebaseAppName: db.app.name,
          authUid: '',
          authEmail: null,
          documentPath: '',
          readExecuted: false,
          docExists: null,
          docData: null,
          errorCode: 'NO_AUTH_USER',
          errorMessage: 'لا يوجد مستخدم مسجل دخول في Firebase Authentication حالياً.',
          rawError: null,
          customClaimFound: false,
        },
      };
    }

    const uid = targetUser.uid;
    const adminDocRef = doc(db, 'admins', uid);

    // 1. Check custom claims in ID token (force refresh token to get latest claims if updated)
    let customClaimFound = false;
    let tokenClaims: Record<string, unknown> | undefined = undefined;
    try {
      const tokenResult = await targetUser.getIdTokenResult(true);
      tokenClaims = tokenResult.claims;
      if (tokenResult.claims && (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin')) {
        customClaimFound = true;
        return {
          isAdmin: true,
          method: 'custom_claim',
          details: {
            role: (tokenResult.claims.role as string) || 'admin',
            email: targetUser.email || undefined,
            docId: uid,
          },
          diagnostics: {
            checkedAt: new Date().toISOString(),
            projectId: resolvedProjectId,
            firebaseAppName: db.app.name,
            authUid: uid,
            authEmail: targetUser.email || null,
            documentPath: adminDocRef.path,
            readExecuted: false,
            docExists: null,
            docData: null,
            errorCode: null,
            errorMessage: null,
            rawError: null,
            customClaimFound: true,
            tokenClaims,
          },
        };
      }
    } catch (claimErr) {
      console.warn('[AdminService] Token claim verification check:', claimErr);
    }

    // 2. Query Firestore /admins/{userId} document
    let docSnap;
    let cacheBypassed = false;
    try {
      try {
        docSnap = await getDocFromServer(adminDocRef);
        cacheBypassed = true;
      } catch (serverErr: any) {
        if (serverErr?.code === 'permission-denied') {
          // In case auth token sync to Firestore connection was slightly delayed, wait 350ms and retry once
          await new Promise((res) => setTimeout(res, 350));
          docSnap = await getDoc(adminDocRef);
        } else {
          docSnap = await getDoc(adminDocRef);
        }
      }

      const docExists = docSnap.exists();
      const rawData = docExists ? docSnap.data() : null;

      if (docExists) {
        const role = rawData?.role ? String(rawData.role).toLowerCase().trim() : 'admin';
        return {
          isAdmin: true,
          method: 'firestore_doc',
          details: {
            role: role || 'admin',
            email: rawData?.email || targetUser.email || undefined,
            grantedAt: rawData?.grantedAt || undefined,
            docId: docSnap.id,
          },
          diagnostics: {
            checkedAt: new Date().toISOString(),
            projectId: resolvedProjectId,
            firebaseAppName: db.app.name,
            authUid: uid,
            authEmail: targetUser.email || null,
            documentPath: adminDocRef.path,
            readExecuted: true,
            docExists: true,
            docData: rawData as Record<string, unknown>,
            errorCode: null,
            errorMessage: null,
            rawError: null,
            customClaimFound: false,
            tokenClaims,
            cacheBypassed,
          },
        };
      }

      return {
        isAdmin: false,
        method: 'none',
        diagnostics: {
          checkedAt: new Date().toISOString(),
          projectId: resolvedProjectId,
          firebaseAppName: db.app.name,
          authUid: uid,
          authEmail: targetUser.email || null,
          documentPath: adminDocRef.path,
          readExecuted: true,
          docExists: false,
          docData: null,
          errorCode: null,
          errorMessage: `المستند ${adminDocRef.path} غير موجود (exists() = false). يرجى التأكد من اسم المجموعة admins ورقم المعرف UID بدقة.`,
          rawError: null,
          customClaimFound: false,
          tokenClaims,
          cacheBypassed,
        },
      };
    } catch (err: any) {
      const code = err?.code || 'FIRESTORE_ERROR';
      const message = err?.message || String(err);

      console.warn('[AdminService] Firestore read check notice:', {
        code,
        message,
        path: adminDocRef.path,
      });

      const userFriendlyMessage =
        code === 'permission-denied'
          ? 'تم رفض إذن القراءة من قِبل قواعد أمان Firestore في Firebase Console (permission-denied). يُرجى نشر قواعد الأمان المخصصة في Firebase Console > Firestore Database > Rules.'
          : message;

      return {
        isAdmin: false,
        method: 'none',
        diagnostics: {
          checkedAt: new Date().toISOString(),
          projectId: resolvedProjectId,
          firebaseAppName: db.app.name,
          authUid: uid,
          authEmail: targetUser.email || null,
          documentPath: adminDocRef.path,
          readExecuted: true,
          docExists: null,
          docData: null,
          errorCode: code,
          errorMessage: userFriendlyMessage,
          rawError: String(err),
          customClaimFound: false,
          tokenClaims,
          cacheBypassed,
        },
      };
    }
  }

  /**
   * Realtime observer for /admins/{userId} document changes.
   * Ensures instant UI updates whenever an admin document is added, modified, or deleted in Firestore.
   */
  subscribeToAdminStatus(
    user: User | null,
    onStatusChange: (status: AdminStatusResult) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe {
    const targetUser = user || auth.currentUser;
    const resolvedProjectId = db.app.options.projectId || firebaseConfig.projectId || 'shashtak-tv';

    if (!targetUser) {
      onStatusChange({ isAdmin: false, method: 'none' });
      return () => {};
    }

    const uid = targetUser.uid;
    if (!uid) {
      onStatusChange({ isAdmin: false, method: 'none' });
      return () => {};
    }

    // Check custom claims first
    targetUser.getIdTokenResult(false).then((tokenResult) => {
      if (tokenResult.claims && (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin')) {
        onStatusChange({
          isAdmin: true,
          method: 'custom_claim',
          details: {
            role: (tokenResult.claims.role as string) || 'admin',
            email: targetUser.email || undefined,
            docId: uid,
          },
        });
      }
    }).catch((err) => {
      console.warn('[AdminService] onSnapshot claim check notice:', err);
    });

    // Realtime Firestore listener on exact document /admins/{uid}
    const adminDocRef = doc(db, 'admins', uid);

    const unsubscribe = onSnapshot(
      adminDocRef,
      (docSnap) => {
        const docExists = docSnap.exists();

        if (docExists) {
          const data = docSnap.data();
          const role = data?.role ? String(data.role).toLowerCase().trim() : 'admin';
          onStatusChange({
            isAdmin: true,
            method: 'firestore_doc',
            details: {
              role: role || 'admin',
              email: data?.email || targetUser.email || undefined,
              grantedAt: data?.grantedAt || undefined,
              docId: docSnap.id,
            },
            diagnostics: {
              checkedAt: new Date().toISOString(),
              projectId: resolvedProjectId,
              firebaseAppName: db.app.name,
              authUid: uid,
              authEmail: targetUser.email || null,
              documentPath: adminDocRef.path,
              readExecuted: true,
              docExists: true,
              docData: data as Record<string, unknown>,
              errorCode: null,
              errorMessage: null,
              rawError: null,
              customClaimFound: false,
            },
          });
        } else {
          onStatusChange({
            isAdmin: false,
            method: 'none',
            diagnostics: {
              checkedAt: new Date().toISOString(),
              projectId: resolvedProjectId,
              firebaseAppName: db.app.name,
              authUid: uid,
              authEmail: targetUser.email || null,
              documentPath: adminDocRef.path,
              readExecuted: true,
              docExists: false,
              docData: null,
              errorCode: null,
              errorMessage: `مستند الأدمن غير موجود (${adminDocRef.path}).`,
              rawError: null,
              customClaimFound: false,
            },
          });
        }
      },
      (error: any) => {
        const code = error?.code || 'SNAPSHOT_ERROR';
        const message = error?.message || String(error);
        console.warn(`[AdminService] onSnapshot access restricted on ${adminDocRef.path}:`, {
          code,
          message,
        });

        if (onError) onError(error);

        const userFriendlyMessage =
          code === 'permission-denied'
            ? 'تم رفض اشتراك المراقبة اللحظية بواسطة قواعد الأمان (permission-denied). يُرجى نشر قواعد الأمان في Firebase Console.'
            : message;

        onStatusChange({
          isAdmin: false,
          method: 'none',
          diagnostics: {
            checkedAt: new Date().toISOString(),
            projectId: resolvedProjectId,
            firebaseAppName: db.app.name,
            authUid: uid,
            authEmail: targetUser.email || null,
            documentPath: adminDocRef.path,
            readExecuted: true,
            docExists: null,
            docData: null,
            errorCode: code,
            errorMessage: userFriendlyMessage,
            rawError: String(error),
            customClaimFound: false,
          },
        });
      }
    );

    return unsubscribe;
  }
}

export const adminService = new AdminService();
