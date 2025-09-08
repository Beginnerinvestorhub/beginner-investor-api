/**
 * Firebase Configuration Template
 * Copy this file to lib/firebase.ts and configure with your Firebase project settings
 * This template includes proper error handling for missing environment variables
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if required Firebase environment variables are present
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Firebase not initialized: Missing environment variables:', missingEnvVars.join(', '));
  console.error('Please set the following environment variables in your .env.local file or deployment platform:');
  missingEnvVars.forEach(envVar => {
    console.error(`- ${envVar}`);
  });
}

// Initialize Firebase app only if environment variables are present
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  if (missingEnvVars.length === 0) {
    // Initialize Firebase only if not already initialized
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    
    // Connect to Auth emulator in development if specified
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Connected to Firebase Auth emulator');
      } catch (error) {
        console.warn('Failed to connect to Firebase Auth emulator:', error);
      }
    }
    
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase initialization skipped due to missing environment variables');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Export auth with null check protection
export { auth };

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = (): boolean => {
  return auth !== null && missingEnvVars.length === 0;
};

// Helper function to get initialization status
export const getFirebaseStatus = () => {
  return {
    initialized: isFirebaseInitialized(),
    missingEnvVars,
    hasApp: app !== null,
    hasAuth: auth !== null
  };
};

export default app;
