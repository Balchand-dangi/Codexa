import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase config
console.log(' [Firebase Config] projectId:', firebaseConfig.projectId ? '✅' : '❌');
console.log(' [Firebase Config] VAPID key present:', import.meta.env.VITE_FIREBASE_VAPID_KEY ? '✅' : '❌');

if (!firebaseConfig.projectId) {
    console.error(' Firebase projectId is missing! Check .env.local');
}

if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) {
    console.error(' VAPID key is missing! Check .env.local');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✓ Firebase initialized');

// Initialize Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);
console.log('✓ Cloud Messaging initialized');

export { messaging, getToken, onMessage };
