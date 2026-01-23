const express = require('express');
const User = require('../model/userSchema');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

// Save/Update FCM token for user
router.post('/save-token', userAuth, async (req, res) => {
    try {
        const { token } = req.body;
        const userEmail = req.user.email;

        console.log('📨 [/save-token] Request received from:', userEmail);
        console.log('📨 [/save-token] Token provided:', token ? `${token.substring(0, 30)}...` : 'MISSING');

        if (!token) {
            console.log('❌ [/save-token] Token is required');
            return res.status(400).json({ message: 'FCM token is required' });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.log('❌ [/save-token] User not found in database:', userEmail);
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize fcmTokens array if it doesn't exist
        if (!user.fcmTokens) {
            user.fcmTokens = [];
            console.log('🆕 [/save-token] Initialized fcmTokens array for user');
        }

        if (!user.fcmTokens.includes(token)) {
            user.fcmTokens.push(token);
            await user.save();
            console.log(`✓ [/save-token] FCM token SAVED. Total tokens: ${user.fcmTokens.length} for ${userEmail}`);
        } else {
            console.log('⚠️  [/save-token] Token already exists (duplicate), skipping');
        }

        res.status(200).json({
            message: 'FCM token saved successfully',
            success: true,
            totalTokens: user.fcmTokens.length
        });
    } catch (err) {
        console.error('❌ [/save-token] Error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Remove FCM token (when user logs out)
router.post('/remove-token', userAuth, async (req, res) => {
    try {
        const { token } = req.body;
        const userEmail = req.user.email;

        if (!token) {
            return res.status(400).json({ message: 'FCM token is required' });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.log(' User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.fcmTokens) {
            const initialCount = user.fcmTokens.length;
            user.fcmTokens = user.fcmTokens.filter(t => t !== token);
            await user.save();

        } else {
            console.log('⚠ User has no fcmTokens array');
        }

        res.status(200).json({
            message: 'FCM token removed successfully',
            success: true,
            remainingTokens: user.fcmTokens ? user.fcmTokens.length : 0
        });
    } catch (err) {
        console.error(' /remove-token error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
