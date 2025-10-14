import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// Use environment variables for sensitive or configuration data in a real application
const firebaseConfig = {
  // Use environment variables for better security and configuration management
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
// Check if the app is already initialized to prevent errors in Next.js development mode (hot reloading)
// In a real application, you might also check if the API key is present before initializing.
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
// Export `auth` for use in other parts of your application
export const auth: Auth = getAuth(app);

// Export the Firebase App instance if needed elsewhere
export { app };