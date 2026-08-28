'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/utils/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore?: Firestore | null;
  auth?: Auth | null;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isCancelled = false;

    const startAuthListener = async () => {
      if (isCancelled) return;
      try {
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        if (isCancelled) return;
        
        const authInstance = getAuth(firebaseApp);
        
        unsubscribe = onAuthStateChanged(
          authInstance,
          (firebaseUser) => { // Auth state determined
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
          },
          (error) => { // Auth listener error
            console.error("FirebaseProvider: onAuthStateChanged error:", error);
            setUserAuthState({ user: null, isUserLoading: false, userError: error });
          }
        );
      } catch (err: any) {
        setUserAuthState({ user: null, isUserLoading: false, userError: err });
      }
    };

    // If on admin route or admin session exists, start auth listener; otherwise skip to prevent iframe overhead
    const isAdmin = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') || 
      sessionStorage.getItem('is_admin') === '1'
    );

    if (isAdmin) {
      setUserAuthState({ user: null, isUserLoading: true, userError: null });
      startAuthListener();
    } else {
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
    }

    return () => {
      isCancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseApp]); // Depends on the firebaseApp instance

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: firebaseApp || null,
      firestore: firestore || null,
      auth: auth || null,
      user: userAuthState.user,
      isUserLoading: auth ? userAuthState.isUserLoading : false,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return {
    firebaseApp: context.firebaseApp as any,
    firestore: context.firestore as any,
    auth: context.auth as any,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  const { firebaseApp } = useFirebase();
  // Provide a safe way to get Auth without throwing errors if used properly
  try {
    const { getAuth } = require('firebase/auth');
    return getAuth(firebaseApp);
  } catch {
    return null;
  }
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError };
};
