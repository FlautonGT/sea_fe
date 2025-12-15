'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Admin, AdminLoginResponse } from '@/types/admin';
import { adminLogin, adminVerifyMFA, adminLogout, adminRefreshToken } from '@/lib/adminApi';

// Admin data from login response (as per ADMIN_COMPLETE_DOCS.md)
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: {
    code: string;
    name: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  mfaToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_KEY = 'admin_data';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  // Load admin from sessionStorage on mount
  useEffect(() => {
    const loadAdmin = () => {
      try {
        const savedAdmin = sessionStorage.getItem(ADMIN_KEY);
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (savedAdmin && token) {
          setAdmin(JSON.parse(savedAdmin));
        }
      } catch (error) {
        console.error('Failed to load admin data:', error);
        sessionStorage.removeItem(ADMIN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdmin();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === '/panel-admin/login';
    const isAdminRoute = pathname.startsWith('/panel-admin');

    if (!admin && isAdminRoute && !isLoginPage) {
      router.replace('/panel-admin/login');
    } else if (admin && isLoginPage) {
      router.replace('/panel-admin');
    }
  }, [admin, isLoading, pathname, router]);

  const handleLoginResponse = useCallback((response: AdminLoginResponse) => {
    console.log('[AdminAuth] Login response:', response);

    // Check if MFA is required (has step: "MFA_VERIFICATION")
    if (response.step === 'MFA_VERIFICATION' && response.mfaToken) {
      setMfaRequired(true);
      setMfaToken(response.mfaToken);
      return;
    }

    // Success response has token object and admin object (no step field)
    if (response.token && response.admin) {
      sessionStorage.setItem(TOKEN_KEY, response.token.accessToken);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, response.token.refreshToken);
      sessionStorage.setItem(ADMIN_KEY, JSON.stringify(response.admin));
      setAdmin(response.admin);
      setMfaRequired(false);
      setMfaToken(null);
      console.log('[AdminAuth] Login successful, redirecting to /panel-admin');
      router.replace('/panel-admin');
      return;
    }

    console.error('[AdminAuth] Unexpected response format:', response);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await adminLogin(email, password);
      handleLoginResponse(response);
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginResponse]);

  const verifyMFA = useCallback(async (code: string) => {
    if (!mfaToken) {
      throw new Error('No MFA token available');
    }

    setIsLoading(true);
    try {
      const response = await adminVerifyMFA(mfaToken, code);
      handleLoginResponse(response);
    } finally {
      setIsLoading(false);
    }
  }, [mfaToken, handleLoginResponse]);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_KEY);
      setAdmin(null);
      router.replace('/panel-admin/login');
    }
  }, [router]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!admin?.role) return false;
    // SUPERADMIN has all permissions
    if (admin.role.code === 'SUPERADMIN') return true;
    // For other roles, we need to check permissions from the full admin data
    // The login response only includes basic admin info, so for now SUPERADMIN check is enough
    // In production, you might want to fetch full admin details or include permissions in token
    return false;
  }, [admin]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const value = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    mfaRequired,
    mfaToken,
    login,
    verifyMFA,
    logout,
    hasPermission,
    hasAnyPermission,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

