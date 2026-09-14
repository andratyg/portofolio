'use client';
    
import type {
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Recursively strips any keys with `undefined` values from objects
 * so Firestore never throws "Unsupported field value: undefined".
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeFirestoreData(value);
      }
    }
    return sanitized as T;
  }
  return data;
}

/**
 * Initiates a setDoc operation for a document reference.
 * Returns the Promise so caller can await if needed, and strips any `undefined` fields.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  const sanitized = sanitizeFirestoreData(data);
  return import('firebase/firestore').then(({ setDoc }) => {
    return setDoc(docRef, sanitized, options || {}).catch(error => {
      console.error(`[Firestore write error] ${docRef.path}:`, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: sanitized,
        })
      );
      throw error;
    });
  });
}

/**
 * Initiates an addDoc operation for a collection reference.
 * Returns the Promise for the new doc ref, and strips any `undefined` fields.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const sanitized = sanitizeFirestoreData(data);
  return import('firebase/firestore').then(({ addDoc }) => {
    return addDoc(colRef, sanitized).catch(error => {
      console.error(`[Firestore create error] ${colRef.path}:`, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: sanitized,
        })
      );
      throw error;
    });
  });
}

/**
 * Initiates an updateDoc operation for a document reference.
 * Returns the Promise so caller can await if needed, and strips any `undefined` fields.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  const sanitized = sanitizeFirestoreData(data);
  return import('firebase/firestore').then(({ updateDoc }) => {
    return updateDoc(docRef, sanitized).catch(error => {
      console.error(`[Firestore update error] ${docRef.path}:`, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: sanitized,
        })
      );
      throw error;
    });
  });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 * Returns the Promise so caller can await if needed.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  return import('firebase/firestore').then(({ deleteDoc }) => {
    return deleteDoc(docRef).catch(error => {
      console.error(`[Firestore delete error] ${docRef.path}:`, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
      throw error;
    });
  });
}

