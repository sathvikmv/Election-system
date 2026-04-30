import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * 
 * Uses environment variables for production configuration.
 * Falls back to localStorage-based persistence if Firebase
 * credentials are incomplete (e.g., missing appId).
 */
const firebaseConfig = {
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

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization failed, using localStorage fallback:", e);
  useLocalFallback = true;
}

/**
 * Persistence API — abstracts over Firestore or localStorage.
 * This ensures the app works both with and without full Firebase credentials.
 */
export async function saveSession(sessionId: string, data: Record<string, any>): Promise<void> {
  if (db && !useLocalFallback) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db!, 'sessions', sessionId), {
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

export async function loadSession(sessionId: string): Promise<Record<string, any> | null> {
  if (db && !useLocalFallback) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docSnap = await getDoc(doc(db!, 'sessions', sessionId));
      if (docSnap.exists()) {
        return docSnap.data();
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
      try { return JSON.parse(stored); } catch { return null; }
    }
  }
  return null;
}

export { db };
