// Firebase Configuration for Global XT Chat System (Firestore Only)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  // No databaseURL needed - using Firestore only
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure auth settings
auth.languageCode = 'en';

// Connect to emulators in development (optional) - DISABLED
// Uncomment the lines below if you want to use Firebase emulators
/*
if (import.meta.env.DEV && typeof window !== 'undefined') {
  try {
    // Only connect if not already connected (simplified check)
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulators already connected or not available
    console.log('Firebase emulators not connected:', error);
  }
}
*/

export default app;


