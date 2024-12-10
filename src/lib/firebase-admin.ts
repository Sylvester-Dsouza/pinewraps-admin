// Ensure this file is only used on the server side
if (typeof window !== 'undefined') {
  throw new Error('This file should only be used on the server side');
}

import * as admin from 'firebase-admin';

function formatPrivateKey(key: string | undefined) {
  if (!key) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set in environment variables');
  }

  // If the key is wrapped in quotes, remove them
  key = key.replace(/^["']|["']$/g, '');
  
  // If the key already contains newlines, don't process it further
  if (key.includes('\n')) {
    return key;
  }

  // Add newlines to private key if they're encoded as \n
  return key.replace(/\\n/g, '\n');
}

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!privateKey || !clientEmail || !projectId) {
        throw new Error('Firebase credentials not found in environment variables');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          privateKey: formatPrivateKey(privateKey),
          clientEmail,
          projectId,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }

  return admin;
}

// Initialize and export Firebase Admin instance
const firebaseAdmin = initializeFirebaseAdmin();
export const storage = firebaseAdmin.storage();
export const auth = firebaseAdmin.auth();
export const db = firebaseAdmin.firestore();
export { firebaseAdmin as admin };
