"use server";

import { initializeApp, getApps, cert, App as AdminApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getStorage, Storage } from "firebase-admin/storage";

let adminApp: AdminApp | undefined;
let firestore: Firestore | undefined;
let auth: Auth | undefined;
let storage: Storage | undefined;

export function getAdminApp(): AdminApp {
  if (!adminApp) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bigmints-xtara";
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "";
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";

    adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return adminApp;
}

export function getAdminFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getAdminApp());
  }
  return firestore;
}

export function getAdminAuth(): Auth {
  if (!auth) {
    auth = getAuth(getAdminApp());
  }
  return auth;
}

export function getAdminStorage(): Storage {
  if (!storage) {
    storage = getStorage(getAdminApp());
  }
  return storage;
}
