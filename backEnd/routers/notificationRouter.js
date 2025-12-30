const express = require('express')
const Notification = require('../model/notificationSchema')
const userAuth = require('../middleware/userAuth')

const router = express.Router()

// Get all notifications for logged-in user
router.get('/', userAuth, async (req, res) => {
    try {
        const userEmail = req.user.email
        const notifications = await Notification.find({ recipient: userEmail })
            .sort({ createdAt: -1 })
            .limit(30) // Limit to last 50 notifications
        
        const unreadCount = notifications.filter(n => !n.isRead).length
        
        res.status(200).json({ 
            notifications,
            unreadCount 
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get unread notifications count
router.get('/unread-count', userAuth, async (req, res) => {
    try {
        const userEmail = req.user.email
        const count = await Notification.countDocuments({ 
            recipient: userEmail, 
            isRead: false 
        })
        
        res.status(200).json({ unreadCount: count })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Mark notification as read
router.patch('/:notificationId/read', userAuth, async (req, res) => {
    try {
        const { notificationId } = req.params
        const userEmail = req.user.email

        const notification = await Notification.findOne({ 
            _id: notificationId, 
            recipient: userEmail 
        })
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        notification.isRead = true
        await notification.save()

        res.status(200).json({ message: 'Notification marked as read' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Mark all notifications as read
router.patch('/mark-all-read', userAuth, async (req, res) => {
    try {
        const userEmail = req.user.email
        
        await Notification.updateMany(
            { recipient: userEmail, isRead: false },
            { isRead: true }
        )

        res.status(200).json({ message: 'All notifications marked as read' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Clear all notifications
router.delete('/clear-all', userAuth, async (req, res) => {
    try {
        const userEmail = req.user.email
        
        await Notification.deleteMany({ recipient: userEmail })

        res.status(200).json({ message: 'All notifications cleared' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// Delete a notification
router.delete('/:notificationId', userAuth, async (req, res) => {
    try {
        const { notificationId } = req.params
        const userEmail = req.user.email

        const result = await Notification.findOneAndDelete({ 
            _id: notificationId, 
            recipient: userEmail 
        })

        if (!result) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        res.status(200).json({ message: 'Notification deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router