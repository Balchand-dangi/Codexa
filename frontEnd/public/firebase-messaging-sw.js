// Import Firebase scripts with error handling
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyDTnxlY46lQBUpp454Vh91A2NFn2eY4_84",
    authDomain: "codexa-web.firebaseapp.com",
    projectId: "codexa-web",
    storageBucket: "codexa-web.firebasestorage.app",
    messagingSenderId: "835605948028",
    appId: "1:835605948028:web:c484d02306c203bef08bf9",
};

try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.error('Firebase initialization failed:', error);
}

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/favicon.ico',
        badge: payload.notification.badge || '/favicon.ico',
        data: payload.data,
        tag: payload.data.type || 'notification',
        requireInteraction: false,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const clickedNotification = event.notification;
    const data = clickedNotification.data;

    // Open window or focus existing one
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === data.click_action && 'focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(data.click_action || '/');
        }
    });
});
