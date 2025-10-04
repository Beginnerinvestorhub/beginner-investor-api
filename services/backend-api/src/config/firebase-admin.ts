// services/backend-api/src/config/firebase-admin.ts

import admin from 'firebase-admin';

// Validate required environment variables
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error(
    'Missing Firebase credentials. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.'
  );
}

// Handle private key formatting
const formattedPrivateKey = FIREBASE_PRIVATE_KEY.includes('\\n')
  ? FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : FIREBASE_PRIVATE_KEY;

// Optional sanity check for PEM format
if (!formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
  throw new Error('Invalid Firebase private key format. Check .env for correct escaping.');
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: formattedPrivateKey,
    }),
  });
}

// Export Firebase services
export const auth = admin.auth();
export const firestore = admin.firestore();
export const messaging = admin.messaging();
export { admin };
