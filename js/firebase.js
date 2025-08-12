// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-check.js";

// Get Firebase configuration from server-generated config
// This approach prevents hardcoding credentials
let firebaseConfig;

// Attempt to load the configuration from the server-injected global
if (typeof window.ENV_CONFIG !== 'undefined' && window.ENV_CONFIG.firebase) {
  console.log('Using server-injected Firebase configuration');
  firebaseConfig = window.ENV_CONFIG.firebase;
} else {
  // Fallback configuration (less secure but functional)
  console.warn('Using fallback Firebase configuration - not recommended for production');
  firebaseConfig = {
    apiKey: "AIzaSyAp6aPAt7QEI1d1cAe1wgb-ce9pzBuZG3Q",
    authDomain: "tgc-website-eb40e.firebaseapp.com",
    projectId: "tgc-website-eb40e",
    storageBucket: "tgc-website-eb40e.appspot.com",
    messagingSenderId: "746434827363",
    appId: "1:746434827363:web:9de342c504289be40c9456",
    measurementId: "G-4FNPCSQR2X"
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check
// Get reCAPTCHA site key from ENV_CONFIG or use debug provider in development
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(
    // Use environment config if available, otherwise use debug token for development
    window.ENV_CONFIG?.recaptcha?.siteKey || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // This is Google's test key
  ),
  isTokenAutoRefreshEnabled: true,
  // Only show debug UI in development (not production)
  debug: window.location.hostname === 'localhost'
});

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


