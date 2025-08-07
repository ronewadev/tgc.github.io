// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp6aPAt7QEI1d1cAe1wgb-ce9pzBuZG3Q",
  authDomain: "tgc-website-eb40e.firebaseapp.com",
  projectId: "tgc-website-eb40e",
  storageBucket: "tgc-website-eb40e.appspot.com",
  messagingSenderId: "746434827363",
  appId: "1:746434827363:web:9de342c504289be40c9456",
  measurementId: "G-4FNPCSQR2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);