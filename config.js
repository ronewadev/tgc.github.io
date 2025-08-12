// config.js - Centralized configuration management
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Public configuration - safe to expose to the browser
const publicConfig = {
  // These values will be available in the browser
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  },
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY
  },
  appVersion: process.env.npm_package_version || '1.0.0',
};

// Private configuration - server-side only, never exposed
const privateConfig = {
  // These values will never be sent to the browser
  firebase: {
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    serviceAccountId: process.env.FIREBASE_SERVICE_ACCOUNT_ID
  },
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-jwt-key-that-should-be-changed',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  }
};

// Helper function to generate public config for browser
const getPublicConfig = () => {
  return publicConfig;
};

// Export configurations
module.exports = {
  public: publicConfig,
  private: privateConfig,
  getPublicConfig
};
