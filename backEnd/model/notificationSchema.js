const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: String,
        required: true,
        ref: 'User' // email of the user who will receive notification
    },
    sender: {
        type: String,
        required: true,
        ref: 'User' // email of the user who triggered notification
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ProjectModel'
    },
    projectTitle: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'collaboration_request', 'stage_submission', 'stage_submission_result'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    commentText: {
        type: String // Only for comment notifications
    },
    isRead: {
        type: Boolean,
        default: false
    },
    senderName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    collaborationRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CollaborationRequest'
    }
}, { timestamps: true })

const Notification = mongoose.model('Notification', notificationSchema, 'notifications')

module.exports = Notification
