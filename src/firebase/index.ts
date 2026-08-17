import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";
import { useCollection } from "./firestore/use-collection";
import { useDoc } from "./firestore/use-doc";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, useCollection, useDoc };

export function initializeFirebase() {
  return { firebaseApp: app, auth, firestore: db, storage };
}

export * from './provider';
export * from './client-provider';
