'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/useAuthQuery';
import { apiClient } from '@/lib/api';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  initialized: boolean;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, error, isError } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    // Initialize API client with token on app start
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      // Initialize Zustand auth store
      import('@/store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().initialize();
      });
    } catch (error) {
      // Ignore localStorage errors in SSR
    }
  }, []);

  // Sync user data with Zustand store when it changes
  useEffect(() => {
    if (user) {
      import('@/store/authStore').then(({ useAuthStore }) => {
        const store = useAuthStore.getState();
        if (store.user?.id !== user.id) {
          store.setUser(user);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    // Handle authentication errors (e.g., expired token)
    if (isError && error?.response?.status === 401) {
      // Clear invalid tokens
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        apiClient.clearAuthToken();
      } catch (error) {
        console.warn('Failed to clear invalid tokens:', error);
      }
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        router.push('/login');
      }
    }
  }, [isError, error, router]);

  const isAuthenticated = !!user && !error && !isError;
  const initialized = !isLoading;

  return (
    <AuthContext.Provider value={{ 
      initialized, 
      user: user || null, 
      isLoading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}