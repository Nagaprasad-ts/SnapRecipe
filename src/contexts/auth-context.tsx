
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase/config';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true); // Indicate that we are determining auth state.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // firebaseUser will be null if not logged in or after logout
      setLoading(false);   // Auth state determined.
    });

    // Handle redirect sign-in attempt only once on initial load.
    // onAuthStateChanged will ultimately reflect the user state from this or direct sign-in.
    getRedirectResult(auth).catch((error) => {
      // This error is often "auth/no-redirect-operation" if the page wasn't loaded from a redirect.
      // It's generally safe to ignore this specific error unless debugging redirects.
      if (error.code !== 'auth/no-redirect-operation') {
        console.error("Error processing redirect result:", error);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount.


  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting user and loading state.
      // Successful sign-in will trigger onAuthStateChanged, then components might redirect.
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false); // Ensure loading is false on error
    }
    // setLoading(false) will be handled by onAuthStateChanged on success.
  };

  const signOutUser = async () => {
    setLoading(true); // Indicate an operation is in progress
    try {
      await signOut(auth); // This will trigger onAuthStateChanged
      router.push('/'); // Redirect to home page after sign out call
      // setUser(null) and setLoading(false) will be handled by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false); // Ensure loading is false on error, if onAuthStateChanged doesn't fire
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

