import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const env = import.meta.env;

export const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "AIzaSyD7pk7euD5vgwX1PcfRsM50b4WuVH-kKNE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "smart-study-planner-e0a4d.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "smart-study-planner-e0a4d",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "smart-study-planner-e0a4d.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "77067519405",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:77067519405:web:3b602d6a1860ee81bacd24",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let _auth: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

let _db: Firestore | null = null;
export function getDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

/**
 * Lazy proxies: Firebase is only initialized on first real property access,
 * which keeps SSR (where there is no browser auth environment) from booting it.
 */
function lazy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get: (_t, prop, receiver) => Reflect.get(factory() as object, prop, receiver),
    set: (_t, prop, value) => Reflect.set(factory() as object, prop, value),
    has: (_t, prop) => Reflect.has(factory() as object, prop),
    getPrototypeOf: () => Reflect.getPrototypeOf(factory() as object),
    ownKeys: () => Reflect.ownKeys(factory() as object),
    getOwnPropertyDescriptor: (_t, prop) =>
      Reflect.getOwnPropertyDescriptor(factory() as object, prop),
  });
}

export const auth: Auth = lazy(getFirebaseAuth);
export const db: Firestore = lazy(getDb);
