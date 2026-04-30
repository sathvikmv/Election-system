"use client";

/**
 * Firebase Configuration
 * 
 * Strategy: Always use localStorage for session persistence.
 * Firebase Firestore is optional and only used if fully configured.
 * This guarantees the app NEVER crashes due to Firebase issues.
 */

export async function saveSession(sessionId: string, data: Record<string, unknown>): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`session_${sessionId}`, JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.warn('localStorage write failed:', err);
    }
  }
}

export async function loadSession(sessionId: string): Promise<Record<string, unknown> | null> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`session_${sessionId}`);
      if (stored) {
        return JSON.parse(stored) as Record<string, unknown>;
      }
    } catch (err) {
      console.warn('localStorage read failed:', err);
    }
  }
  return null;
}
