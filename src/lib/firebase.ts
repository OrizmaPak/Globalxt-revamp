import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";

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

try {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (import.meta.env.DEV) {
    console.log('✅ Firebase initialized successfully!');
    console.log('Firebase App Name:', firebaseApp.name);
    console.log('Firebase Project ID:', firebaseApp.options.projectId);
  }
} catch (err) {
  if (import.meta.env.DEV) {
    console.error('❌ Firebase initialization failed:', err);
    console.log('Using fallback configuration instead');
  }
  firebaseApp = null;
}

export { firebaseApp };

export default firebaseApp;
