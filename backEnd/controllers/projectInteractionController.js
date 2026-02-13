const { Like, Comment, CollaborationRequest } = require('../model/projectInteractionSchema')
const Notification = require('../model/notificationSchema')
const Project = require('../model/projectSchema')
const mongoose = require('mongoose')

// Like a project
exports.likeProject = async (req, res) => {
    try {
        const { projectId } = req.params
        const userEmail = req.user.email
        const userName = req.user.name

        // Check if project exists
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Check if user already liked
        const existingLike = await Like.findOne({ projectId, userEmail })
        if (existingLike) {
            return res.status(400).json({ message: 'You already liked this project' })
        }

        // Create like
        await Like.create({ projectId, userEmail, userName })

        // Create notification for project owner (if not liking own project)
        if (project.email !== userEmail) {
            await Notification.create({
                recipient: project.email,
                sender: userEmail,
                senderName: userName,
                projectId,
                projectTitle: project.title,
                type: 'like',
                message: `${userName} liked your project "${project.title}"`
            })
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
        const userEmail = req.user.email

        const result = await Like.findOneAndDelete({ projectId, userEmail })
        if (!result) {
            return res.status(404).json({ message: 'Like not found' })
        }

        res.status(200).json({ message: 'Project unliked successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get likes for a project
exports.getLikes = async (req, res) => {
    try {
        const { projectId } = req.params
        const likes = await Like.find({ projectId }).sort({ createdAt: -1 })
        res.status(200).json({ 
            count: likes.length, 
            likes: likes.map(like => ({ 
                userName: like.userName, 
                userEmail: like.userEmail,
                createdAt: like.createdAt 
            })) 
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Comment on a project
exports.addComment = async (req, res) => {
    try {
        const { projectId } = req.params
        const { text } = req.body
        const userEmail = req.user.email
        const userName = req.user.name

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'Comment text is required' })
        }

        if (text.length > 500) {
            return res.status(400).json({ message: 'Comment must be less than 500 characters' })
        }

        // Check if project exists
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Create comment
        const comment = await Comment.create({ 
            projectId, 
            userEmail, 
            userName, 
            text: text.trim() 
        })

        // Create notification for project owner (if not commenting on own project)
        if (project.email !== userEmail) {
            await Notification.create({
                recipient: project.email,
                sender: userEmail,
                senderName: userName,
                projectId,
                projectTitle: project.title,
                type: 'comment',
                message: `${userName} commented on your project "${project.title}"`,
                commentText: text.trim()
            })
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
        const comments = await Comment.find({ projectId }).sort({ createdAt: -1 })
        res.status(200).json({ 
            count: comments.length, 
            comments 
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Delete a comment (only by comment owner)
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const userEmail = req.user.email

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' })
        }

        if (comment.userEmail !== userEmail) {
            return res.status(403).json({ message: 'You can only delete your own comments' })
        }

        await Comment.findByIdAndDelete(commentId)
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
        const requesterEmail = req.user.email
        const requesterName = req.user.name

        // Check if project exists
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Check if requesting collaboration on own project
        if (project.email === requesterEmail) {
            return res.status(400).json({ message: 'You cannot send collaboration request on your own project' })
        }

        // Check if already requested
        const existingRequest = await CollaborationRequest.findOne({ 
            projectId, 
            requesterEmail 
        })
        if (existingRequest) {
            return res.status(400).json({ 
                message: `You already sent a collaboration request (Status: ${existingRequest.status})` 
            })
        }

        // Create collaboration request and STORE THE RETURNED DOCUMENT
        const collaborationRequest = await CollaborationRequest.create({
            projectId,
            projectOwnerEmail: project.email,
            requesterEmail,
            requesterName,
            message: message || ''
        })

        // Create notification for project owner WITH collaborationRequestId
        await Notification.create({
            recipient: project.email,
            sender: requesterEmail,
            senderName: requesterName,
            projectId,
            projectTitle: project.title,
            type: 'collaboration_request',
            message: `${requesterName} sent a collaboration request for "${project.title}"`,
            collaborationRequestId: collaborationRequest._id
        })

        res.status(201).json({ message: 'Collaboration request sent successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get collaboration requests
exports.getCollaborationRequests = async (req, res) => {
    try {
        const { projectId } = req.query
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'User not authenticated' })
        }
        const filter = {} // anyone can see the team status
        if (projectId) {
            if (mongoose.Types.ObjectId.isValid(projectId)) {
                filter.projectId = new mongoose.Types.ObjectId(projectId)
            } else {
                return res.status(400).json({ message: 'Invalid project ID' })
            }
        }
        const requests = await CollaborationRequest.find(filter)
            .populate('projectId')
            .sort({ createdAt: -1 })
        res.json({ requests })
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching requests',
            error: error.message 
        })
    }
}

// Update collaboration request status
exports.updateCollaborationRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params
        const { status } = req.body
        const userEmail = req.user.email
        
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        const request = await CollaborationRequest.findById(requestId)
        if (!request) {
            return res.status(404).json({ message: 'Request not found' })
        }

        if (request.projectOwnerEmail !== userEmail) {
            return res.status(403).json({ message: 'Unauthorized' })
        }

        request.status = status
        await request.save()

        res.status(200).json({ message: `Request ${status}`, request })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}


