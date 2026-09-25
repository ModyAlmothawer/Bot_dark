import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { adminService, AdminStatusResult } from '../services/adminService';

interface AuthContextType {
  user: User | null;
  uid: string | null;
  loading: boolean;
  isAdmin: boolean;
  adminStatus: AdminStatusResult | null;
  isAdminLoading: boolean;
  refreshAdminStatus: () => Promise<AdminStatusResult>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminStatus, setAdminStatus] = useState<AdminStatusResult | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(true);

  // Manual refresh helper
  const refreshAdminStatus = useCallback(async (): Promise<AdminStatusResult> => {
    setIsAdminLoading(true);
    try {
      const activeUser = user || authService.getCurrentUser();
      const result = await adminService.checkAdminStatus(activeUser);
      setAdminStatus(result);
      return result;
    } catch (err: any) {
      console.warn('[AuthContext] refreshAdminStatus error:', err);
      const fallback: AdminStatusResult = {
        isAdmin: false,
        method: 'none',
        diagnostics: {
          checkedAt: new Date().toISOString(),
          projectId: 'shashtak-tv',
          firebaseAppName: '[DEFAULT]',
          authUid: user?.uid || '',
          authEmail: user?.email || null,
          documentPath: `admins/${user?.uid || ''}`,
          readExecuted: true,
          docExists: null,
          docData: null,
          errorCode: err?.code || 'REFRESH_ERROR',
          errorMessage: err?.message || String(err),
          rawError: String(err),
          customClaimFound: false,
        },
      };
      setAdminStatus(fallback);
      return fallback;
    } finally {
      setIsAdminLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let unsubscribeAdmin: (() => void) | null = null;

    // Subscribe to Firebase Auth state
    const unsubscribeAuth = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Clean up previous admin listener if user changed
      if (unsubscribeAdmin) {
        unsubscribeAdmin();
        unsubscribeAdmin = null;
      }

      if (!firebaseUser) {
        setAdminStatus({ isAdmin: false, method: 'none' });
        setIsAdminLoading(false);
      } else {
        setIsAdminLoading(true);

        // 1. Immediate check with checkAdminStatus
        adminService
          .checkAdminStatus(firebaseUser)
          .then((res) => {
            setAdminStatus(res);
            setIsAdminLoading(false);
          })
          .catch((err) => {
            console.warn('[AuthContext] Initial checkAdminStatus error:', err);
            setIsAdminLoading(false);
          });

        // 2. Realtime listener to /admins/{uid} document
        unsubscribeAdmin = adminService.subscribeToAdminStatus(
          firebaseUser,
          (status) => {
            setAdminStatus(status);
            setIsAdminLoading(false);
          },
          (err) => {
            console.warn('[AuthContext] subscribeToAdminStatus warning:', err);
          }
        );
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeAdmin) {
        unsubscribeAdmin();
      }
    };
  }, []);

  const login = async (email: string, pass: string) => {
    await authService.signInWithEmailAndPassword(email, pass);
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setAdminStatus({ isAdmin: false, method: 'none' });
    setIsAdminLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        uid: user?.uid ?? null,
        loading,
        isAdmin: Boolean(adminStatus?.isAdmin),
        adminStatus,
        isAdminLoading,
        refreshAdminStatus,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
