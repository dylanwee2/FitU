// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuVKw3ya0CUoc7tXg0TOBD4FPUBOkoKps",
  authDomain: "fitu-466a8.firebaseapp.com",
  projectId: "fitu-466a8",
  storageBucket: "fitu-466a8.firebasestorage.app",
  messagingSenderId: "563583902741",
  appId: "1:563583902741:web:a0cc0f2b64d2ea5bde1a1c",
  measurementId: "G-HH4VZ6VM5Y"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Export what you need
export { app, db, auth, storage };