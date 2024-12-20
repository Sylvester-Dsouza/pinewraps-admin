'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
  id: string;
  email: string | null;
  role: string;
  name: string | null;
  adminAccess: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to verify token');
      }

      if (!data.success) {
        throw new Error(data.error?.message || 'Token verification failed');
      }

      return data.data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Get fresh token
          const token = await firebaseUser.getIdToken(true);

          try {
            // Verify with backend
            const userData = await verifyToken(token);
            
            // Set the token in cookie only after successful verification
            Cookies.set('admin-token', token, { secure: true });
            
            setUser(userData);
            
            if (window.location.pathname === '/login') {
              router.push('/dashboard');
            }
          } catch (error: any) {
            console.error('Verify error:', error);
            // If verification fails, sign out
            await logout();
            toast({
              title: 'Authentication Error',
              description: error.message || 'Please sign in again',
              variant: 'destructive',
            });
          }
        } else {
          setUser(null);
          Cookies.remove('admin-token');
          if (window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        Cookies.remove('admin-token');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      try {
        // Verify with backend
        const userData = await verifyToken(token);
        
        // Set the token in cookie
        Cookies.set('admin-token', token, { secure: true });
        
        setUser(userData);
        router.push('/dashboard');

        toast({
          title: 'Success',
          description: 'Successfully logged in',
          variant: 'default',
        });
      } catch (error: any) {
        // If verification fails, sign out from Firebase
        await firebaseSignOut(auth);
        throw error;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in';

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      Cookies.remove('admin-token');
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
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
