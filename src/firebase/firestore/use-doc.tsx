'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsubscribe: (() => void) | undefined;
    let isCancelled = false;

    const startListener = () => {
      if (isCancelled) return;
      try {
        unsubscribe = onSnapshot(
          memoizedDocRef,
          (snapshot: DocumentSnapshot<DocumentData>) => {
            if (snapshot.exists()) {
              setData({ ...(snapshot.data() as T), id: snapshot.id });
            } else {
              setData(null);
            }
            setError(null);
            setIsLoading(false);
          },
          (error: FirestoreError) => {
            const contextualError = new FirestorePermissionError({
              operation: 'get',
              path: memoizedDocRef.path,
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
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
