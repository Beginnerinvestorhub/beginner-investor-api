import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAwatQASRMtJKkrATJXrpNUzzG2VxSYCf0',
  authDomain: 'beginnerinvestorhub-8ce1f.firebaseapp.com',
  projectId: 'beginnerinvestorhub-8ce1f',
  storageBucket: 'beginnerinvestorhub-8ce1f.firebasestorage.app',
  messagingSenderId: '807595603132',
  appId: '1:807595603132:web:6a2be21962544669f9ccb9',
  measurementId: 'G-S2FYWXCWGB',
};

// Initialize Firebase
let app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Only initialize Firebase if API key is available (prevents build-time errors)

let auth: any = null;

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  app = initializeApp(firebaseConfig);
  const analytics =
    typeof window !== 'undefined' ? getAnalytics(app) : undefined;
  auth = getAuth(app);
} else {
  console.warn(
    'Firebase not initialized: Missing NEXT_PUBLIC_FIREBASE_API_KEY'
  );
}

export { app, analytics, auth };
