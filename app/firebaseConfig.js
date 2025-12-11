import {
    FIREBASE_API_KEY,
    FIREBASE_APP_ID,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_MEASUREMENT_ID,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
} from "@env";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Allow Expo's built-in env support (EXPO_PUBLIC_*) while remaining
// backward compatible with the existing @env import. This prevents the
// Firebase config from being empty when Metro fails to load .env.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || FIREBASE_API_KEY,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || FIREBASE_APP_ID,
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || FIREBASE_MEASUREMENT_ID,
};

// Fail fast with a clear error if config is missing (helps catch env issues).
if (!firebaseConfig.apiKey) {
  throw new Error(
    "Firebase API key is missing. Check your .env / EXPO_PUBLIC_* variables."
  );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
