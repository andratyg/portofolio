'use client';

import { useState, useEffect } from 'react';
import type { FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '@/firebase/provider';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export function useCollection<T = any>(
    path: string | null | undefined,
): UseCollectionResult<T> {
  const firestore = useFirestore();
  const [data, setData] = useState<WithId<T>[] | null>(null);
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
        const { onSnapshot, collection } = await import('firebase/firestore');
        if (isCancelled) return;
        
        const colRef = collection(firestore, path);
        unsubscribe = onSnapshot(
          colRef,
          (snapshot: any) => {
            const results: WithId<T>[] = [];
            for (const doc of snapshot.docs) {
              results.push({ ...(doc.data() as T), id: doc.id });
            }
            setData(results);
            setError(null);
            setIsLoading(false);
          },
          (err: any) => {
            const contextualError = new FirestorePermissionError({
              operation: 'list',
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
