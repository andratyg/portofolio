'use client';
    
import { useState, useEffect } from 'react';
import type { FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '@/firebase/provider';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export function useDoc<T = any>(
  path: string | null | undefined,
): UseDocResult<T> {
  const firestore = useFirestore();
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!path || !firestore) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsubscribe: (() => void) | undefined;
    let isCancelled = false;

    const startListener = async () => {
      if (isCancelled) return;
      try {
        const { onSnapshot, doc } = await import('firebase/firestore');
        if (isCancelled) return;

        const docRef = doc(firestore, path);
        unsubscribe = onSnapshot(
          docRef,
          (snapshot: any) => {
            if (snapshot.exists()) {
              setData({ ...(snapshot.data() as T), id: snapshot.id });
            } else {
              setData(null);
            }
            setError(null);
            setIsLoading(false);
          },
          (err: any) => {
            const contextualError = new FirestorePermissionError({
              operation: 'get',
              path,
            });

            setError(contextualError);
            setData(null);
            setIsLoading(false);
            errorEmitter.emit('permission-error', contextualError);
          }
        );
      } catch (err) {
        setIsLoading(false);
      }
    };

    let idleHandle: any;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleHandle = (window as any).requestIdleCallback(startListener, { timeout: 4000 });
    } else {
      idleHandle = setTimeout(startListener, 500);
    }

    return () => {
      isCancelled = true;
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof idleHandle === 'number') {
        (window as any).cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }
      if (unsubscribe) unsubscribe();
    };
  }, [path, firestore]);

  return { data, isLoading, error };
}
