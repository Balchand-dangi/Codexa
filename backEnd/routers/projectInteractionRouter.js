const express = require('express')
const { Like, Comment, CollaborationRequest } = require('../model/projectInteractionSchema')
const Notification = require('../model/notificationSchema')
const Project = require('../model/projectSchema')
const User = require('../model/userSchema')
const userAuth = require('../middleware/userAuth')
const rate_limiter = require('../middleware/rate_limiter')
const mongoose = require('mongoose')
const { notifyLike, notifyComment, notifyCollaborationRequest } = require('../services/notificationService')



const router = express.Router()

// Like a project
router.post('/like/:projectId', userAuth, async (req, res) => {
    try {
        const { projectId } = req.params
        const userEmail = req.user.email
        const userName = req.user.name

        console.log(`\n [Like] User ${userEmail} liked project ${projectId}`);

        // Check if project exists
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        console.log(`    Project: "${project.title}" by ${project.email}`);

        // Check if user already liked
        const existingLike = await Like.findOne({ projectId, userEmail })
        if (existingLike) {
            return res.status(400).json({ message: 'You already liked this project' })
        }

        // Create like
        await Like.create({ projectId, userEmail, userName })

        // Create notification for project owner (if not liking own project)
        if (project.email !== userEmail) {
            console.log(`    Creating notification for project owner: ${project.email}`);

            await Notification.create({
                recipient: project.email,
                sender: userEmail,
                senderName: userName,
                projectId,
                projectTitle: project.title,
                type: 'like',
                message: `${userName} liked your project "${project.title}"`
            })

            // Send real-time notification via Firebase
            console.log(`    Sending Firebase notification...`);
            const notificationSent = await notifyLike(project.email, userName, project.title, projectId, userEmail)
            console.log(`   ✓ Notification sent: ${notificationSent}`);
        } else {
            console.log(`   ⚠ User liked own project - no notification sent`);
        }

        res.status(200).json({ message: 'Project liked successfully' })
    } catch (err) {
        console.error(' [Like] Error:', err.message);
        res.status(500).json({ message: err.message })
    }
})

// Unlike a project
router.delete('/unlike/:projectId', userAuth, async (req, res) => {
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
})

// Get likes for a project
router.get('/likes/:projectId', userAuth, async (req, res) => {
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
})

// Comment on a project
router.post('/comment/:projectId', userAuth, rate_limiter, async (req, res) => {
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

            // Send real-time notification via Firebase
            await notifyComment(project.email, userName, project.title, projectId, text.trim(), userEmail)
        }

        res.status(201).json({ message: 'Comment added successfully', comment })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get comments for a project
router.get('/comments/:projectId', userAuth, async (req, res) => {
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
})

// Delete a comment (only by comment owner)
router.delete('/comment/:commentId', userAuth, async (req, res) => {
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
})

// Send collaboration request
router.post('/collaborate/:projectId', userAuth, rate_limiter, async (req, res) => {
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
            collaborationRequestId: collaborationRequest._id  // ADD THIS LINE
        })

        // Send real-time notification via Firebase
        await notifyCollaborationRequest(project.email, requesterName, project.title, projectId, requesterEmail)

        res.status(201).json({ message: 'Collaboration request sent successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})



// to get team status
router.get('/collaboration-requests', userAuth, async (req, res) => {
    try {
        const { projectId } = req.query
        // console.log('Received projectId:', projectId)
        // console.log('User:', req.user) 
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'User not authenticated' })
        }
        // const filter = { projectOwnerEmail: req.user.email }  // I want the only owner can see the team status
        const filter = {} // anyone can see the team status
        if (projectId) {
            if (mongoose.Types.ObjectId.isValid(projectId)) {
                filter.projectId = new mongoose.Types.ObjectId(projectId)
            } else {
                return res.status(400).json({ message: 'Invalid project ID' })
            }
        }
        // console.log('Filter:', filter)
        const requests = await CollaborationRequest.find(filter)
            .populate('projectId')
            .sort({ createdAt: -1 })
        // console.log('Found requests:', requests.length)
        res.json({ requests })
    } catch (error) {
        // console.error('Error fetching collaboration requests:', error)
        res.status(500).json({
            message: 'Error fetching requests',
            error: error.message
        })
    }
})


// Update collaboration request status
router.patch('/collaboration-request/:requestId', userAuth, async (req, res) => {
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
})

module.exports = router