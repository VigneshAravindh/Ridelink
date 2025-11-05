// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:  process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "taxi-app-tn.firebaseapp.com",
  projectId: "taxi-app-tn",
  storageBucket: "taxi-app-tn.firebasestorage.app",
  messagingSenderId: "598307357687",
  appId: "1:598307357687:web:c9fa6db28bbcc424f924f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app); // optional
export const serverTime = serverTimestamp;
export default app;