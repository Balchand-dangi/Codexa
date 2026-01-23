import { useEffect, useState, useCallback, useRef } from 'react';
import { messaging, getToken, onMessage } from '../config/firebase';
import axios from 'axios';

const useFCM = () => {
    const [token, setToken] = useState(null);
    const [notification, setNotification] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [lastLoginState, setLastLoginState] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const tokenRef = useRef(null);

    useEffect(() => {
        const initializeFCM = async () => {
            try {
                console.log('🚀 [initializeFCM] Starting FCM initialization...');

                // Register service worker with proper error handling
                if ('serviceWorker' in navigator) {
                    try {
                        console.log('📝 [initializeFCM] Registering service worker...');
                        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                            scope: '/'
                        });
                        console.log('✓ [initializeFCM] Service Worker registered successfully');
                    } catch (err) {
                        console.error('✗ [initializeFCM] Service Worker registration failed:', err.message);
                        throw new Error(`Service Worker failed: ${err.message}`);
                    }
                } else {
                    console.error('✗ [initializeFCM] Service Worker not supported in this browser');
                    throw new Error('Service Worker not supported');
                }

                // Request notification permission
                console.log('🔔 [initializeFCM] Current notification permission:', Notification.permission);

                if (Notification.permission === 'granted') {
                    console.log('✓ [initializeFCM] Notification permission already granted, getting token...');
                    await getTokenAndSave();
                } else if (Notification.permission !== 'denied') {
                    console.log('❓ [initializeFCM] Requesting notification permission from user...');
                    const permission = await Notification.requestPermission();
                    console.log('📤 [initializeFCM] User response:', permission);

                    if (permission === 'granted') {
                        console.log('✓ [initializeFCM] Permission granted by user, getting token...');
                        await getTokenAndSave();
                    } else {
                        console.log('❌ [initializeFCM] Permission denied by user');
                        setIsReady(true);
                    }
                } else {
                    console.log('❌ [initializeFCM] Notifications are blocked for this site');
                    setIsReady(true);
                }

                // Set isReady immediately so removeToken can be called on logout
                // Don't wait for permission prompt
                setTimeout(() => {
                    if (!localStorage.getItem('fcmToken')) {
                        console.log('⏳ [initializeFCM] Setting isReady=true to enable logout handling');
                        setIsReady(true);
                    }
                }, 100);

                // Handle foreground messages
                try {
                    const unsubscribe = onMessage(messaging, (payload) => {
                        console.log('🎯 [initializeFCM] Foreground message received:', payload);
                        setNotification({
                            title: payload.notification.title,
                            body: payload.notification.body,
                            data: payload.data,
                            timestamp: new Date()
                        });

                        // Show browser notification for foreground
                        if (Notification.permission === 'granted') {
                            new Notification(payload.notification.title, {
                                body: payload.notification.body,
                                icon: payload.notification.icon || '/favicon.ico',
                            });
                        }
                    });

                    return () => {
                        unsubscribe();
                    };
                } catch (error) {
                    console.warn('⚠ [initializeFCM] Error setting up foreground message listener:', error);
                }
            } catch (error) {
                console.error('✗ [initializeFCM] Critical error during FCM init:', error);
                setIsReady(true);
            }
        };

        initializeFCM();
    }, []);

    const getTokenAndSave = useCallback(async () => {
        try {
            console.log('⏳ [getTokenAndSave] Requesting FCM token...');
            const currentToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });

            if (currentToken) {
                setToken(currentToken);
                tokenRef.current = currentToken;
                // Store FCM token in localStorage for logout use
                localStorage.setItem('fcmToken', currentToken);
                console.log('✓ [getTokenAndSave] FCM Token obtained:', currentToken.substring(0, 50) + '...');

                // Send token to backend
                try {
                    const authToken = localStorage.getItem('token');
                    console.log('🔍 [getTokenAndSave] authToken present:', !!authToken);
                    if (authToken) {
                        console.log('📤 [getTokenAndSave] Sending to /api/fcm/save-token...');
                        const response = await axios.post(
                            '/api/fcm/save-token',
                            { token: currentToken },
                            {
                                headers: {
                                    'Authorization': `Bearer ${authToken}`
                                }
                            }
                        );
                        console.log('✓ [getTokenAndSave] FCM token sent to server:', response.data);
                    } else {
                        console.warn('⚠ [getTokenAndSave] No auth token found. User may not be logged in.');
                    }
                } catch (err) {
                    console.error('✗ [getTokenAndSave] Error sending token to server:', err.message);
                }
            } else {
                console.warn('⚠ [getTokenAndSave] No FCM token available');
            }
            setIsReady(true);
        } catch (err) {
            console.error('✗ [getTokenAndSave] Error getting FCM token:', err);
            setIsReady(true);
        }
    }, []);

    const removeToken = useCallback(async () => {
        try {
            const currentToken = tokenRef.current || localStorage.getItem('fcmToken');
            //console.log(' removeToken called, token available:', !!currentToken);

            if (currentToken) {
                const authToken = localStorage.getItem('token');
                //console.log(' authToken available:', !!authToken);

                if (authToken) {
                    //console.log(' Sending removeToken request to server...');
                    console.log('FCM Token to remove:', currentToken.substring(0, 30) + '...');

                    try {
                        const response = await axios.post(
                            '/api/fcm/remove-token',
                            { token: currentToken },
                            {
                                headers: {
                                    'Authorization': `Bearer ${authToken}`
                                },
                                withCredentials: true
                            }
                        );
                        console.log('✓ FCM token removed from server:', response.data);
                    } catch (apiError) {
                        console.error('❌ API Error in removeToken:', {
                            status: apiError.response?.status,
                            message: apiError.response?.data?.message || apiError.message,
                            data: apiError.response?.data
                        });
                        throw apiError;
                    }
                } else {
                    //console.log('⚠ No auth token found for remove-token call');
                }
            } else {
                console.log('⚠ No FCM token to remove (already cleared from localStorage)');
            }

            // Always clear from state and localStorage
            setToken(null);
            tokenRef.current = null;
            localStorage.removeItem('fcmToken');
            //console.log('✓ FCM token cleared from state and localStorage');
        } catch (err) {
            console.error('❌ Error removing token:', err.message || err);
        }
    }, []);

    // Monitor login/logout state changes from localStorage
    useEffect(() => {
        const checkLoginState = setInterval(() => {
            const isLoggedInNow = localStorage.getItem('isLoggedIn') === 'true';
            if (isLoggedInNow !== lastLoginState) {
                console.log('🔄 [Polling] Login state changed:', lastLoginState, '→', isLoggedInNow);
                setLastLoginState(isLoggedInNow);

                if (!isLoggedInNow) {
                    // User logged out - immediately call removeToken
                    console.log('🚨 [Polling] LOGOUT DETECTED - Calling removeToken');
                    removeToken();
                } else {
                    // User logged in - immediately call getTokenAndSave
                    console.log('🚨 [Polling] LOGIN DETECTED - Calling getTokenAndSave');
                    getTokenAndSave();
                }
            }
        }, 500);

        return () => clearInterval(checkLoginState);
    }, [lastLoginState, removeToken, getTokenAndSave]);

    return { token, notification, removeToken, isReady };
};

export default useFCM;
