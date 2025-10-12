import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const fallbackConfig: FirebaseOptions = {
  apiKey: "AIzaSyCk2RuLqnxuUb70VztZU4jiPZsMX_-slLc",
  authDomain: "global-xt.firebaseapp.com",
  projectId: "global-xt",
  storageBucket: "global-xt.firebasestorage.app",
  messagingSenderId: "941795650549",
  appId: "1:941795650549:web:13a893fac0172b1407cebc",
};

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? fallbackConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? fallbackConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;

// Debug logging for Firebase configuration
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Configuration Check:');
  console.log('Environment variables:', {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'
  });
  console.log('Final config being used:', {
    apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? 'SET' : 'MISSING'
  });
}

// Always initialize the app; do not fail the app if Storage fails
try {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (import.meta.env.DEV) {
    console.log('✅ Firebase App initialized');
  }
} catch (err) {
  console.error('❌ Firebase App initialization failed:', err);
  firebaseApp = null;
}

// Try to initialize Storage separately, but continue without it on failure
if (firebaseApp) {
  try {
    storage = getStorage(firebaseApp);
    if (import.meta.env.DEV) {
      console.log('✅ Firebase Storage initialized');
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Firebase Storage initialization failed, continuing without Storage:', err);
    }
    storage = null;
  }
}

if (import.meta.env.DEV && firebaseApp) {
  console.log('Firebase App Name:', firebaseApp.name);
  console.log('Firebase Project ID:', firebaseApp.options.projectId);
}

export { firebaseApp, storage };

export default firebaseApp;
