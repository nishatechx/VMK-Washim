// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDCOUtngEBaDceNNNQY7n4XA4AulU2IgnA",
  authDomain: "vmk-erp.firebaseapp.com",
  projectId: "vmk-erp",
  storageBucket: "vmk-erp.firebasestorage.app",
  messagingSenderId: "700750943390",
  appId: "1:700750943390:web:7c6eb8df98991acc6ad78f"
};

// Initialize Firebase
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom or default database ID
const databaseId = (firebaseConfigData as Record<string, any>)?.firestoreDatabaseId;
export const db: Firestore = databaseId
  ? getFirestore(firebaseApp, databaseId)
  : getFirestore(firebaseApp);

