const { messaging } = require('../config/firebase');
const User = require('../model/userSchema');

// Send real-time notification via FCM
const sendRealTimeNotification = async (recipientEmail, notificationData) => {
    try {
        console.log(`\n📬 [sendRealTimeNotification] Attempting to send notification to: ${recipientEmail}`);

        // Get user with FCM tokens
        const user = await User.findOne({ email: recipientEmail });

        if (!user) {
            console.log(`❌ [sendRealTimeNotification] User not found: ${recipientEmail}`);
            return false;
        }

        if (!user.fcmTokens || user.fcmTokens.length === 0) {
            console.log(`❌ [sendRealTimeNotification] No FCM tokens found for user: ${recipientEmail}`);
            console.log(`   User exists but fcmTokens array is empty or missing`);
            console.log(`   → User needs to login and grant notification permission`);
            return false;
        }

        console.log(`✓ [sendRealTimeNotification] Found ${user.fcmTokens.length} FCM token(s) for ${recipientEmail}`);
        console.log(`   Tokens: ${user.fcmTokens.map(t => t.substring(0, 30) + '...').join(', ')}`);

        // Prepare notification payload
        const payload = {
            notification: {
                title: notificationData.title,
                body: notificationData.body,
                icon: notificationData.icon || '/favicon.ico',
                badge: notificationData.badge || '/favicon.ico'
            },
            data: {
                projectId: notificationData.projectId || '',
                type: notificationData.type || '',
                sender: notificationData.sender || '',
                senderName: notificationData.senderName || '',
                click_action: notificationData.clickAction || '/'
            },
            webpush: {
                fcmOptions: {
                    link: notificationData.clickAction || '/'
                }
            }
        };

        console.log(`📤 [sendRealTimeNotification] Sending to ${user.fcmTokens.length} device(s)...`);

        // Send to all devices
        const promises = user.fcmTokens.map((token, index) =>
            messaging.send({
                ...payload,
                token: token
            })
                .then(() => {
                    console.log(`   ✓ Device ${index + 1}/${user.fcmTokens.length}: Notification sent`);
                })
                .catch(err => {
                    console.error(`   ❌ Device ${index + 1}/${user.fcmTokens.length}: Error - ${err.code}`);
                    // Remove invalid tokens
                    if (err.code === 'messaging/invalid-registration-token' ||
                        err.code === 'messaging/registration-token-not-registered') {
                        console.log(`      → Removing invalid token from database`);
                        return User.updateOne(
                            { email: recipientEmail },
                            { $pull: { fcmTokens: token } }
                        );
                    }
                })
        );

        await Promise.all(promises);
        console.log(`✓ [sendRealTimeNotification] Notification delivery completed\n`);
        return true;
    } catch (err) {
        console.error('❌ [sendRealTimeNotification] Error sending real-time notification:', err);
        return false;
    }
};

// ✅ FIXED CODE
const notifyLike = async (recipientEmail, senderName, projectTitle, projectId, senderEmail) => {
    return await sendRealTimeNotification(recipientEmail, {
        title: 'New Like!',
        body: `${senderName} liked your project "${projectTitle}"`,
        type: 'like',
        projectId: projectId.toString(),
        senderName: senderName,
        sender: senderEmail,
        icon: '🔔',
        clickAction: `/project/${projectId}`
    });
};

const notifyComment = async (recipientEmail, senderName, projectTitle, projectId, commentText, senderEmail) => {
    const truncatedComment = commentText.substring(0, 50) + (commentText.length > 50 ? '...' : '');
    return await sendRealTimeNotification(recipientEmail, {
        title: 'New Comment!',
        body: `${senderName} commented: "${truncatedComment}"`,
        type: 'comment',
        projectId: projectId.toString(),
        senderName: senderName,
        sender: senderEmail,
        icon: '💬',
        clickAction: `/project/${projectId}`
    });
};

const notifyCollaborationRequest = async (recipientEmail, senderName, projectTitle, projectId, senderEmail) => {
    return await sendRealTimeNotification(recipientEmail, {
        title: 'Collaboration Request!',
        body: `${senderName} wants to collaborate on "${projectTitle}"`,
        type: 'collaboration_request',
        projectId: projectId.toString(),
        senderName: senderName,
        sender: senderEmail,
        icon: '🤝',
        clickAction: `/project/${projectId}`
    });
};


module.exports = {
    sendRealTimeNotification,
    notifyLike,
    notifyComment,
    notifyCollaborationRequest
};
