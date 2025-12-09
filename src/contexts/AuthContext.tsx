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
    setLocalStorage('auth_token', newToken);
    setLocalStorage('user', newUser);
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
    removeLocalStorage('auth_token');
    removeLocalStorage('user');
  }, [token]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    setLocalStorage('user', updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token?.accessToken) return;
    
    try {
      const response = await getUserProfile(token.accessToken);
      if (response.data) {
        setUser(response.data);
        setLocalStorage('user', response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [token]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = getLocalStorage<AuthToken | null>('auth_token', null);
    const storedUser = getLocalStorage<User | null>('user', null);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Token refresh logic
  useEffect(() => {
    if (!token?.refreshToken || !token?.expiresIn) return;

    const refreshTime = (token.expiresIn - 300) * 1000; // Refresh 5 minutes before expiry
    
    const timeoutId = setTimeout(async () => {
      try {
        const response = await refreshTokenAPI(token.refreshToken);
        if (response.data) {
          setToken(response.data);
          setLocalStorage('auth_token', response.data);
        } else {
          await logout();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        await logout();
      }
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [token, logout]);

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

