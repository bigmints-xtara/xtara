import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Web PROD Configuration from flutter firebase_options.dart
const firebaseConfig = {
  apiKey: "AIzaSyAOREwUatbx8ilMJUDVIJuxfK4fa_bKH1E",
  appId: "1:302405690767:web:8e47b2eb287302deb117fa",
  messagingSenderId: "302405690767",
  projectId: "bigmints-xtara",
  authDomain: "bigmints-xtara.firebaseapp.com",
  storageBucket: "bigmints-xtara.firebasestorage.app",
  measurementId: "G-M39PQHZZMQ",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, db, storage, functions };
