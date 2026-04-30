import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * 
 * Uses environment variables for production configuration.
 * Falls back to localStorage-based persistence if Firebase
 * credentials are incomplete (e.g., missing appId).
 */
/**
 * Firebase Configuration
 * 
 * In production (Cloud Run), we fetch these at runtime to avoid build-time inlining issues.
 */
let firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "just-rhythm-328816.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "just-rhythm-328816",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "just-rhythm-328816.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let useLocalFallback = false;

/**
 * Ensures Firebase is initialized. 
 * On the client, it attempts to fetch runtime config if build-time config is missing.
 */
export async function ensureFirebase(): Promise<Firestore | null> {
  if (db) return db;

  if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.firebase?.apiKey) {
        firebaseConfig = data.firebase;
      }
    } catch (err) {
      console.warn("Failed to fetch runtime Firebase config:", err);
    }
  }

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    return db;
  } catch (e) {
    console.warn("Firebase initialization failed, using localStorage fallback:", e);
    useLocalFallback = true;
    return null;
  }
}

// Initial attempt (sync)
if (typeof window === 'undefined' || firebaseConfig.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  } catch (e) {
    useLocalFallback = true;
  }
}

/**
 * Persistence API — abstracts over Firestore or localStorage.
 * This ensures the app works both with and without full Firebase credentials.
 */
export async function saveSession(sessionId: string, data: Record<string, unknown>): Promise<void> {
  const currentDb = await ensureFirebase();
  
  if (currentDb && !useLocalFallback) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(currentDb, 'sessions', sessionId), {
        ...data,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      return;
    } catch (err) {
      console.warn('Firestore write failed, falling back to localStorage:', err);
    }
  }

  // localStorage fallback
  if (typeof window !== 'undefined') {
    localStorage.setItem(`session_${sessionId}`, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }));
  }
}

export async function loadSession(sessionId: string): Promise<Record<string, unknown> | null> {
  const currentDb = await ensureFirebase();

  if (currentDb && !useLocalFallback) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docSnap = await getDoc(doc(currentDb, 'sessions', sessionId));
      if (docSnap.exists()) {
        return docSnap.data() as Record<string, unknown>;
      }
      return null;
    } catch (err) {
      console.warn('Firestore read failed, falling back to localStorage:', err);
    }
  }

  // localStorage fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`session_${sessionId}`);
    if (stored) {
      try { 
        return JSON.parse(stored) as Record<string, unknown>; 
      } catch { 
        return null; 
      }
    }
  }
  return null;
}

export { db };
