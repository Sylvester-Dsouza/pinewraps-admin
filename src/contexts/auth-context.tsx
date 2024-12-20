'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { authApi } from '@/lib/api';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string | null;
  role: string;
  name: string | null;
  adminAccess: string[];
  isSuperAdmin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Function to refresh token
  const refreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        const response = await authApi.verifyAdminToken(token);
        
        if (response.data.success) {
          Cookies.set('session', token, {
            expires: 7, // Set cookie to expire in 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  // Set up periodic token refresh
  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(refreshToken, 30 * 60 * 1000); // Refresh every 30 minutes
      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          Cookies.remove('session');
          setLoading(false);
          return;
        }

        // Get ID token
        const token = await firebaseUser.getIdToken(true);
        
        try {
          // Verify admin status with backend
          const response = await authApi.verifyAdminToken(token);
          
          if (response.data.success) {
            const userData = response.data.data.user;
            setUser({
              id: userData.id,
              email: firebaseUser.email,
              role: userData.role,
              name: userData.name || firebaseUser.displayName,
              adminAccess: userData.adminAccess || [],
              isSuperAdmin: userData.isSuperAdmin
            });
            
            // Set cookie with extended expiration
            Cookies.set('session', token, {
              expires: 7, // Set cookie to expire in 7 days
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
          } else {
            setUser(null);
            Cookies.remove('session');
            if (pathname !== '/login') {
              router.replace('/login');
            }
          }
        } catch (error) {
          console.error('Error verifying admin status:', error);
          setUser(null);
          Cookies.remove('session');
          if (pathname !== '/login') {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        Cookies.remove('session');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      const response = await authApi.verifyAdminToken(token);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        setUser({
          id: userData.id,
          email: userCredential.user.email,
          role: userData.role,
          name: userData.name || userCredential.user.displayName,
          adminAccess: userData.adminAccess || [],
          isSuperAdmin: userData.isSuperAdmin
        });
        
        // Set cookie with extended expiration
        Cookies.set('session', token, {
          expires: 7, // Set cookie to expire in 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Only redirect to dashboard if we're on the login page
        if (pathname === '/login') {
          router.replace('/dashboard');
        }
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        throw new Error('Not authorized as admin');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to login',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      Cookies.remove('session');
      router.replace('/login');
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to logout',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
