const Notification = require('../model/notificationSchema')
const Project = require('../model/projectSchema')
const { CollaborationRequest } = require('../model/projectInteractionSchema')
const mongoose = require('mongoose')
const { getCache, setCache, deleteKeys, deleteByPatterns } = require('../utils/cache')

const userNotificationsCacheKey = (userEmail) => `notifications:${userEmail}`

// Get all notifications for logged-in user
exports.getNotifications = async (req, res) => {
    try {
        const userEmail = req.user.email
        const key = userNotificationsCacheKey(userEmail)
        const cached = await getCache(key)
        if (cached) {
            const parsed = JSON.parse(cached)
            return res.status(200).json(parsed)
        }
        const notifications = await Notification.find({ recipient: userEmail })
            .sort({ createdAt: -1 })
            .limit(30)

        const unreadCount = notifications.filter(n => !n.isRead).length
        await setCache(key, JSON.stringify({ notifications, unreadCount }), 900) // Cache for 15 minutes

        res.status(200).json({
            notifications,
            unreadCount
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
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
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userEmail = req.user.email
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' })
        }

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userEmail
        })

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        notification.isRead = true
        await notification.save()
        await deleteKeys([userNotificationsCacheKey(userEmail)])

        res.status(200).json({ message: 'Notification marked as read' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userEmail = req.user.email

        await Notification.updateMany(
            { recipient: userEmail, isRead: false },
            { isRead: true }
        )
        await deleteKeys([userNotificationsCacheKey(userEmail)])

        res.status(200).json({ message: 'All notifications marked as read' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Clear all notifications
exports.clearAll = async (req, res) => {
    try {
        const userEmail = req.user.email

        await Notification.deleteMany({ recipient: userEmail })
        await deleteKeys([userNotificationsCacheKey(userEmail)])

        res.status(200).json({ message: 'All notifications cleared' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userEmail = req.user.email
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' })
        }

        const result = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userEmail
        })

        if (!result) {
            return res.status(404).json({ message: 'Notification not found' })
        }
        await deleteKeys([userNotificationsCacheKey(userEmail)])

        res.status(200).json({ message: 'Notification deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Accept collaboration request
exports.acceptCollaboration = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userEmail = req.user.email
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' })
        }

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userEmail,
            type: 'collaboration_request'
        })

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        notification.status = 'accepted'
        notification.isRead = true
        await notification.save()

        // add user to project as team member
        if (notification.collaborationRequestId) {
            const request = await CollaborationRequest.findById(notification.collaborationRequestId)

            if (request) {
                const senderEmail = request.requesterEmail
                const project = await Project.findById(request.projectId)

                if (!project) {
                    return res.status(404).json({ message: 'Project not found' })
                }

                if (project.email === senderEmail) {
                    console.warn('Project owner cannot be added as team member:', senderEmail)
                } else {
                    const alreadyMember = project.team_members.some(
                        member => member.email === senderEmail
                    )

                    if (!alreadyMember) {
                        project.team_members.push({ email: senderEmail })
                        await project.save()
                    }
                }

                await deleteByPatterns([
                    `MY_PROJECTS:${senderEmail}:*`,
                    `MY_PROJECTS:${project.email}:*`
                ])
            }
        }

        // Update the collaboration request - WITH ERROR HANDLING
        if (notification.collaborationRequestId) {
            const updatedRequest = await CollaborationRequest.findByIdAndUpdate(
                notification.collaborationRequestId,
                { status: 'accepted' },
                { new: true, runValidators: true }
            )

            if (!updatedRequest) {
                console.error('Failed to update collaboration request:', notification.collaborationRequestId)
            }
        }

        await deleteKeys([userNotificationsCacheKey(userEmail)])

        res.status(200).json({ message: 'Collaboration request accepted' })
    } catch (err) {
        console.error('Error in accept handler:', err)
        res.status(500).json({ message: err.message })
    }
}

// Reject collaboration request
exports.rejectCollaboration = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userEmail = req.user.email
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' })
        }

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userEmail,
            type: 'collaboration_request'
        })

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        notification.status = 'rejected'
        notification.isRead = true
        await notification.save()

        // Update the collaboration request - WITH ERROR HANDLING
        if (notification.collaborationRequestId) {
            const updatedRequest = await CollaborationRequest.findByIdAndUpdate(
                notification.collaborationRequestId,
                { status: 'rejected' },
                { new: true, runValidators: true }
            )

            if (!updatedRequest) {
                console.error('Failed to update collaboration request:', notification.collaborationRequestId)
            }
        }

        await deleteKeys([userNotificationsCacheKey(userEmail)])

        res.status(200).json({ message: 'Collaboration request rejected' })
    } catch (err) {
        console.error('Error in reject handler:', err)
        res.status(500).json({ message: err.message })
    }
}


