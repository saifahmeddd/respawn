// frontend/src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyB5U32czF6uoK3KI3a7jh7TDH1984nPP98",
  authDomain: "respawn-v5.firebaseapp.com",
  projectId: "respawn-v5",
  storageBucket: "respawn-v5.firebasestorage.app",
  messagingSenderId: "14644284361",
  appId: "1:14644284361:web:2cba25771da4dd977ab618",
  measurementId: "G-CM6EB4Z9W9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
