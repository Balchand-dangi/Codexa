const { Like, Comment, CollaborationRequest } = require('../model/projectInteractionSchema')
const Notification = require('../model/notificationSchema')
const Project = require('../model/projectSchema')
const mongoose = require('mongoose')
const { getIO } = require('../socket')
const { getCache, setCache, deleteByPattern, deleteKeys } = require('../utils/cache')
// Helper: Get project minimally (used everywhere)
const getProjectLean = async (projectId) => {
    return await Project.findById(projectId, { _id: 1, email: 1, title: 1 }).lean()
}

const clearFeedCache = async () => {
    try {
        await deleteByPattern('FEED:*')
    } catch (err) {
        console.log('Redis cache clear error:', err.message)
    }
}

// Matches the cache key in notificationController.js
const clearNotificationCache = async (userEmail) => {
    try {
        await deleteKeys([`notifications:${userEmail}`])
    } catch (err) {
        console.log('Notification cache clear error:', err.message)
    }
}

const likesCacheKey = projectId => `PROJECT_LIKES:${projectId}`
const commentsCacheKey = projectId => `PROJECT_COMMENTS:${projectId}`

// Like a project
exports.likeProject = async (req, res) => {
    try {
        const { projectId } = req.params
        const { email: userEmail, name: userName } = req.user
        const io = getIO()

        const project = await getProjectLean(projectId)
        if (!project) return res.status(404).json({ message: 'Project not found' })

        const existingLike = await Like.findOne({ projectId, userEmail }, { _id: 1 }).lean()
        if (existingLike) return res.status(400).json({ message: 'You already liked this project' })

        await Like.create({ projectId, userEmail, userName })

        await clearFeedCache() // Clear feed cache after like
        await deleteKeys([likesCacheKey(projectId)])

        if (project.email !== userEmail) {
            const notification = await Notification.create({
                recipient: project.email, sender: userEmail, senderName: userName,
                projectId, projectTitle: project.title, type: 'like',
                message: `${userName} liked your project "${project.title}"`
            })
            await clearNotificationCache(project.email)
            if (io) io.to(`user:${project.email}`).emit('new-notification', notification)
        }

        res.status(200).json({ message: 'Project liked successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Unlike a project
exports.unlikeProject = async (req, res) => {
    try {
        const { projectId } = req.params
        const { email: userEmail } = req.user

        const result = await Like.findOneAndDelete({ projectId, userEmail })

        if (!result) return res.status(404).json({ message: 'Like not found' })
        await clearFeedCache() // Clear feed cache after unlike
        await deleteKeys([likesCacheKey(projectId)])

        res.status(200).json({ message: 'Project unliked successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get likes for a project
exports.getLikes = async (req, res) => {
    try {
        const { projectId } = req.params
        const cacheKey = likesCacheKey(projectId)
        const cached = await getCache(cacheKey)
        if (cached) {
            return res.status(200).json(JSON.parse(cached))
        }

        const likes = await Like.find({ projectId })
            .select('userName userEmail createdAt')
            .sort({ createdAt: -1 })
            .lean()

        const response = {
            count: likes.length,
            likes
        }

        await setCache(cacheKey, JSON.stringify(response), 180)
        res.status(200).json(response)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Comment on a project
exports.addComment = async (req, res) => {
    try {
        const { projectId } = req.params
        const { text } = req.body
        const { email: userEmail, name: userName } = req.user
        const io = getIO()

        if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' })
        const trimmedText = text.trim()
        if (trimmedText.length > 500) return res.status(400).json({ message: 'Comment must be less than 500 characters' })

        const project = await getProjectLean(projectId)
        if (!project) return res.status(404).json({ message: 'Project not found' })

        const comment = await Comment.create({ projectId, userEmail, userName, text: trimmedText })
        await clearFeedCache() // Clear feed cache after comment
        await deleteKeys([commentsCacheKey(projectId)])

        // Real-time to project room
        if (io) io.to(`project:${projectId}`).emit('new-comment', comment)

        // Notification to owner (if not self)
        if (project.email !== userEmail) {
            const notification = await Notification.create({
                recipient: project.email, sender: userEmail, senderName: userName,
                projectId, projectTitle: project.title, type: 'comment',
                message: `${userName} commented on your project "${project.title}"`,
                commentText: trimmedText
            })
            await clearNotificationCache(project.email)
            if (io) io.to(`user:${project.email}`).emit('new-notification', notification)
        }

        res.status(201).json({ message: 'Comment added successfully', comment })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get comments for a project
exports.getComments = async (req, res) => {
    try {
        const { projectId } = req.params
        const cacheKey = commentsCacheKey(projectId)
        const cached = await getCache(cacheKey)
        if (cached) {
            return res.status(200).json(JSON.parse(cached))
        }

        const comments = await Comment.find({ projectId })
            .sort({ createdAt: -1 })
            .lean()

        const response = { count: comments.length, comments }
        await setCache(cacheKey, JSON.stringify(response), 180)
        res.status(200).json(response)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const { email: userEmail, role: userRole } = req.user
        const io = getIO()

        const comment = await Comment.findById(commentId, { userEmail: 1, projectId: 1 }).lean()
        if (!comment) return res.status(404).json({ message: 'Comment not found' })

        if (comment.userEmail !== userEmail && userRole !== 'admin') {
            return res.status(403).json({ message: 'You can only delete your own comments' })
        }

        await Comment.findByIdAndDelete(commentId)
        await clearFeedCache() // Clear feed cache after comment deletion
        await deleteKeys([commentsCacheKey(comment.projectId)])

        if (io) io.to(`project:${comment.projectId}`).emit('delete-comment', { commentId, projectId: comment.projectId })

        res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Send collaboration request
exports.sendCollaborationRequest = async (req, res) => {
    try {
        const { projectId } = req.params
        const { message } = req.body
        const { email: requesterEmail, name: requesterName } = req.user
        const io = getIO()

        const project = await getProjectLean(projectId)
        if (!project) return res.status(404).json({ message: 'Project not found' })
        if (project.email === requesterEmail) return res.status(400).json({ message: 'Cannot request on own project' })

        const existingRequest = await CollaborationRequest.findOne({ projectId, requesterEmail }, { _id: 1, status: 1 }).lean()
        if (existingRequest) {
            return res.status(400).json({ message: `Already requested (Status: ${existingRequest.status})` })
        }

        const collaborationRequest = await CollaborationRequest.create({
            projectId, projectOwnerEmail: project.email, requesterEmail, requesterName, message: message || ''
        })
        await clearFeedCache() // Clear feed cache after collaboration request

        const notification = await Notification.create({
            recipient: project.email, sender: requesterEmail, senderName: requesterName,
            projectId, projectTitle: project.title, type: 'collaboration_request',
            message: `${requesterName} sent a collaboration request for "${project.title}"`,
            collaborationRequestId: collaborationRequest._id
        })

        await clearNotificationCache(project.email)
        if (io) io.to(`user:${project.email}`).emit('new-notification', notification)

        res.status(201).json({ message: 'Collaboration request sent successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get collaboration requests (unchanged, but add .lean() + projection if not populating full docs)
exports.getCollaborationRequests = async (req, res) => {
    try {
        const { projectId } = req.query
        if (!req.user?.email) return res.status(401).json({ message: 'User not authenticated' })

        const filter = projectId ? { projectId: new mongoose.Types.ObjectId(projectId) } : {}
        const requests = await CollaborationRequest.find(filter)
            .populate('projectId')
            .sort({ createdAt: -1 })
            .lean()  // Add if you don't mutate results

        res.json({ requests })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
