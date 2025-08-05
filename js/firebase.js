// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

async function addJob(jobData) {
  await addDoc(collection(db, "jobs"), jobData);
}