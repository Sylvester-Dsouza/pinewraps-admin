import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setState({ user, loading: false });
    });

    return () => unsubscribe();
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    isAuthenticated: !!state.user,
  };
};
