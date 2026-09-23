import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Server only. Lazy so builds without credentials still succeed.
function app() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = rawKey ? rawKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "") : undefined;

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback initialize without service account credentials (e.g. during build / local emulation)
  return initializeApp({ projectId });
}

export const adminAuth = () => getAuth(app());
export const adminDb = () => getFirestore(app());
