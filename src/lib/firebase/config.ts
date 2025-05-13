
// Inspired by https://firebase.google.com/docs/web/setup#available-libraries

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate essential Firebase config
if (!firebaseConfig.apiKey) {
  throw new Error(
    'Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. ' +
    'Please set it in your .env file. ' +
    'If you do not have a .env file, copy .env.example to .env and fill in your Firebase project credentials.'
  );
}
if (!firebaseConfig.projectId) {
  throw new Error(
    'Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing. ' +
    'Please set it in your .env file. ' +
    'If you do not have a .env file, copy .env.example to .env and fill in your Firebase project credentials.'
  );
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };

