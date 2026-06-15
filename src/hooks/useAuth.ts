import { useEffect } from 'react';
import { onAuthStateChanged } from '../services/firebase/auth';
import { getUserProfile } from '../services/firebase/firestore';
import { useAuthStore } from '../store';
import type { User } from '../types';

export const useAuth = () => {
  const { user, isLoading, isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile as User);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser]);

  return { user, isLoading, isAuthenticated };
};