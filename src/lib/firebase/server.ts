import 'server-only';
import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

/**
 * Initializes Firebase Admin SDK.
 * This file is marked with 'server-only' to ensure it's never included in client-side bundles.
 */

function initializeAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  // If we have a service account key in environment (useful for local dev or specific CI)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    }
  }

  // Fallback to Application Default Credentials (ADC)
  // This is preferred for Google Cloud environments (Cloud Run, etc.)
  return initializeApp({
    projectId,
  });
}

const adminApp = initializeAdmin();
const adminDb: Firestore = getFirestore(adminApp);
const adminAuth: Auth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth };
