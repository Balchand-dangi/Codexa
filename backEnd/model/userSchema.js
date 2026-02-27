const mongoose = require('mongoose')

// schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        maxLength: 20,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
    },

    age: {
        type: Number,
        required: true,
        min: 15,
        max: 70
    },

    skills: {
        type: [String],
        required: true,

    },

    college: {
        type: String,
        required: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },
    role:{
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
   },

    workflowAcceptedVersion: {
        type: Number,
        default: 0,
        min: 0
    },

    workflowRemindLaterUntil: {
        type: Date,
        default: null
    },

    emailVerifyToken: String,
    emailVerifyTokenExpiry: Date,

    passwordResetToken: String,
    passwordResetTokenExpiry: Date

}, { timestamps: true });

const User = mongoose.model('ModelName', userSchema, 'myUsersCollection');

module.exports = User
