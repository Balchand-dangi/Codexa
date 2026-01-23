const { messaging } = require('../config/firebase');
const User = require('../model/userSchema');

// Send real-time notification via FCM
const sendRealTimeNotification = async (recipientEmail, notificationData) => {
    try {
        // Get user with FCM tokens
        const user = await User.findOne({ email: recipientEmail });

        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            console.log(`No FCM tokens found for user: ${recipientEmail}`);
            return false;
        }

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

        // Send to all devices
        const promises = user.fcmTokens.map(token =>
            messaging.send({
                ...payload,
                token: token
            }).catch(err => {
                console.error(`Error sending to token ${token}:`, err);
                // Remove invalid tokens
                if (err.code === 'messaging/invalid-registration-token' ||
                    err.code === 'messaging/registration-token-not-registered') {
                    return User.updateOne(
                        { email: recipientEmail },
                        { $pull: { fcmTokens: token } }
                    );
                }
            })
        );

        await Promise.all(promises);
        return true;
    } catch (err) {
        console.error('Error sending real-time notification:', err);
        return false;
    }
};

// Helper: Send notification for likes
const notifyLike = async (recipientEmail, senderName, projectTitle, projectId, senderEmail) => {
    await sendRealTimeNotification(recipientEmail, {
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

// Helper: Send notification for comments
const notifyComment = async (recipientEmail, senderName, projectTitle, projectId, commentText, senderEmail) => {
    const truncatedComment = commentText.substring(0, 50) + (commentText.length > 50 ? '...' : '');
    await sendRealTimeNotification(recipientEmail, {
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

// Helper: Send notification for collaboration requests
const notifyCollaborationRequest = async (recipientEmail, senderName, projectTitle, projectId, senderEmail) => {
    await sendRealTimeNotification(recipientEmail, {
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
