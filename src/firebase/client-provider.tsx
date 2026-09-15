'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firestoreInstance, setFirestoreInstance] = React.useState<any>(null);

  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  React.useEffect(() => {
    // Lazily load firestore to save JS payload size, with long polling auto-detection to prevent QUIC timeout errors
    import('firebase/firestore').then(({ initializeFirestore, getFirestore }) => {
      try {
        const db = initializeFirestore(firebaseServices.firebaseApp, {
          experimentalAutoDetectLongPolling: true,
        });
        setFirestoreInstance(db);
      } catch {
        setFirestoreInstance(getFirestore(firebaseServices.firebaseApp));
      }
    });
  }, [firebaseServices.firebaseApp]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firestoreInstance} // Initially null, populates later
    >
      {children}
    </FirebaseProvider>
  );
}
