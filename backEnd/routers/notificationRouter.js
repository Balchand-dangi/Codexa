const express = require('express')
const userAuth = require('../middleware/userAuth')
const notificationController = require('../controllers/notificationController')

const router = express.Router()

// Routes - mapping URLs to controller methods
router.get('/', userAuth, notificationController.getNotifications)
router.get('/unread-count', userAuth, notificationController.getUnreadCount)
router.patch('/:notificationId/read', userAuth, notificationController.markAsRead)
router.patch('/mark-all-read', userAuth, notificationController.markAllAsRead)
router.delete('/clear-all', userAuth, notificationController.clearAll)
router.delete('/:notificationId', userAuth, notificationController.deleteNotification)
router.patch('/:notificationId/accept', userAuth, notificationController.acceptCollaboration)
router.patch('/:notificationId/reject', userAuth, notificationController.rejectCollaboration)

module.exports = router