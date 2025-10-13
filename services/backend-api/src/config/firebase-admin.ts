// services/backend-api/src/config/firebase-admin.ts

import admin from "firebase-admin";
import logger from "../utils/logger";

// Types for Firebase configuration
interface FirebaseCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

// Custom error class for Firebase configuration errors
class FirebaseConfigError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "FirebaseConfigError";
  }
}

/**
 * Validates Firebase credentials format and structure
 */
function validateFirebaseCredentials(
  env: NodeJS.ProcessEnv,
): FirebaseCredentials {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    env;

  if (!FIREBASE_PROJECT_ID?.trim()) {
    throw new FirebaseConfigError(
      "FIREBASE_PROJECT_ID is required but not provided",
      "MISSING_PROJECT_ID",
    );
  }

  if (!FIREBASE_CLIENT_EMAIL?.trim()) {
    throw new FirebaseConfigError(
      "FIREBASE_CLIENT_EMAIL is required but not provided",
      "MISSING_CLIENT_EMAIL",
    );
  }

  if (!FIREBASE_PRIVATE_KEY?.trim()) {
    throw new FirebaseConfigError(
      "FIREBASE_PRIVATE_KEY is required but not provided",
      "MISSING_PRIVATE_KEY",
    );
  }

  // Handle private key formatting (remove double-escaped newlines if present)
  const formattedPrivateKey = FIREBASE_PRIVATE_KEY.includes("\\n")
    ? FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : FIREBASE_PRIVATE_KEY;

  if (formattedPrivateKey.includes("\\n")) {
    logger.warn(
      "Firebase private key contains double-escaped newlines, this may cause issues",
    );
  }

  return {
    projectId: FIREBASE_PROJECT_ID.trim(),
    clientEmail: FIREBASE_CLIENT_EMAIL.trim(),
    privateKey: formattedPrivateKey,
  };
}

/**
 * Initializes Firebase Admin SDK with comprehensive error handling
 */
function initializeFirebaseAdmin(): void {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      logger.info("Firebase Admin SDK already initialized");
      return;
    }

    logger.info("Initializing Firebase Admin SDK...");

    // Validate credentials
    const credentials = validateFirebaseCredentials(process.env);

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
      }),
      // Optional: Add database URL if using Firestore
      // databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    logger.info("Firebase Admin SDK initialized successfully", {
      projectId: credentials.projectId,
    });
  } catch (error) {
    if (error instanceof FirebaseConfigError) {
      logger.error("Firebase configuration error:", {
        code: error.code,
        message: error.message,
      });

      // In development, allow server to start without Firebase
      if (process.env.NODE_ENV !== "production") {
        logger.warn(
          "Running in development mode without Firebase authentication",
        );
        return;
      }

      throw error;
    }

    logger.error("Unexpected error initializing Firebase Admin SDK:", error);
    throw new FirebaseConfigError(
      "Failed to initialize Firebase Admin SDK due to unexpected error",
      "INITIALIZATION_FAILED",
    );
  }
}

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// Export Firebase services with error handling
export function getAuth() {
  if (admin.apps.length === 0) {
    throw new Error("Firebase not initialized");
  }
  return admin.auth();
}

export function getFirestore() {
  if (admin.apps.length === 0) {
    throw new Error("Firebase not initialized");
  }
  return admin.firestore();
}

export function getMessaging() {
  if (admin.apps.length === 0) {
    throw new Error("Firebase not initialized");
  }
  return admin.messaging();
}

export { admin };

// Health check function for Firebase connection
export async function checkFirebaseHealth(): Promise<boolean> {
  try {
    if (admin.apps.length === 0) {
      return false;
    }
    // Try to get the current user (this will fail if Firebase isn't properly configured)
    await admin.auth().listUsers(1);
    return true;
  } catch (error) {
    logger.error("Firebase health check failed error", error);
    return false;
  }
}

/**
 * Check if Firebase Admin SDK is initialized
 */
export function isFirebaseInitialized(): boolean {
  return admin.apps.length > 0;
}
