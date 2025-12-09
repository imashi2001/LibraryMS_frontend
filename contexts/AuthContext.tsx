'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { User, Role, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from storage (non-blocking)
  useEffect(() => {
    // Use requestIdleCallback or setTimeout to make it non-blocking
    const initAuth = () => {
      try {
        const storedToken = authStorage.getToken();
        const storedUser = authStorage.getUser();
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Use immediate execution for fast devices, defer for slower ones
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(initAuth, { timeout: 100 });
    } else {
      // Fallback: small timeout to prevent blocking
      setTimeout(initAuth, 0);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const authData = response.data; // Backend returns AuthResponse directly
      const userData: User = {
        id: authData.id,
        email: authData.email,
        name: authData.name,
        role: authData.role,
        isBlacklisted: false, // Will be updated from profile if needed
        createdAt: new Date().toISOString(),
      };

      // Store token and user
      authStorage.setToken(authData.token);
      authStorage.setUser(userData);

      setToken(authData.token);
      setUser(userData);

      // Redirect to home page after login
      router.push('/');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email: string, name: string, password: string, role: Role) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        name,
        password,
        role,
      });

      // Don't auto-login after registration
      // Just redirect to login page
      router.push('/login');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    authStorage.clear();
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

