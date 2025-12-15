'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthToken } from '@/types';
import { getUserProfile, refreshToken as refreshTokenAPI, logout as logoutAPI } from '@/lib/api';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  token: AuthToken | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: AuthToken, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const login = useCallback((newToken: AuthToken, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    sessionStorage.setItem('user_token', JSON.stringify(newToken));
    sessionStorage.setItem('user_data', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(async () => {
    if (token?.accessToken) {
      try {
        await logoutAPI(token.accessToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('user_token');
    sessionStorage.removeItem('user_data');
  }, [token]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem('user_data', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token?.accessToken) return;

    try {
      const response = await getUserProfile(token.accessToken);
      if (response.data) {
        setUser(response.data);
        sessionStorage.setItem('user_data', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [token]);

  // Initialize auth state from sessionStorage
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('user_token');
      const storedUser = sessionStorage.getItem('user_data');

      if (storedToken && storedUser) {
        setToken(JSON.parse(storedToken));
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth from session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage events or custom events from API interceptors
  useEffect(() => {
    const handleTokenUpdate = (event: CustomEvent<AuthToken>) => {
      setToken(event.detail);
      sessionStorage.setItem('user_token', JSON.stringify(event.detail));
    };

    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth:token-updated', handleTokenUpdate as EventListener);
    window.addEventListener('auth:logout', handleAuthError);

    return () => {
      window.removeEventListener('auth:token-updated', handleTokenUpdate as EventListener);
      window.removeEventListener('auth:logout', handleAuthError);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

