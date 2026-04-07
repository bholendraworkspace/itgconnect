'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

let emulatorsConnected = false;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Static export: initialize directly with config (no App Hosting env vars available)
    const firebaseApp = initializeApp(firebaseConfig);
    const sdks = getSdks(firebaseApp);
    connectToEmulators(sdks);
    return sdks;
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

function connectToEmulators(sdks: ReturnType<typeof getSdks>) {
  if (emulatorsConnected) return;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    connectAuthEmulator(sdks.auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(sdks.firestore, 'localhost', 8080);
    emulatorsConnected = true;
    console.log('🔥 Connected to Firebase emulators');
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
