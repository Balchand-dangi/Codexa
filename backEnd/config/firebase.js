const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Get the service account key
const serviceAccount = require(path.join(__dirname, '../config/firebase-key.json'));

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || ""
});

const db = admin.firestore();
const messaging = admin.messaging();

module.exports = {
    admin,
    db,
    messaging
};
