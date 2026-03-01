const mongoose = require('mongoose')

// Schema for likes
const likeSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ProjectModel'
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }
}, { timestamps: true })

// Schema for comments
const commentSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ProjectModel'
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 500
    }
}, { timestamps: true })

// Schema for collaboration requests
const collaborationRequestSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ProjectModel'
    },
    projectOwnerEmail: {
        type: String,
        required: true
    },
    requesterEmail: {
        type: String,
        required: true
    },
    requesterName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        maxLength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true })

// Create unique indexes to prevent duplicate likes and collaboration requests and get faster queries
likeSchema.index({ projectId: 1, userEmail: 1 }, { unique: true })
collaborationRequestSchema.index({ projectId: 1, requesterEmail: 1 }, { unique: true })
commentSchema.index({ projectId: 1, createdAt: -1 })  // Fast getComments()
collaborationRequestSchema.index({ projectOwnerEmail: 1, status: 1 })


const Like = mongoose.model('Like', likeSchema, 'likes')
const Comment = mongoose.model('Comment', commentSchema, 'comments')
const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema, 'collaborationRequests')

module.exports = { Like, Comment, CollaborationRequest }