const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
    },

    techStack: {
        type: [String],
        required: true
    },

    college: {
        type: String,
        required: true
    },

    category: {
        type: [String],
        required: true
    },

    status: {
        tasks: [{
            id: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                default: ''
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'medium'
            },
            status: {
                type: String,
                enum: ['todo', 'in-progress', 'completed'],
                default: 'todo'
            },
            dueDate: {
                type: Date,
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        overallProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        totalTasks: {
            type: Number,
            default: 0
        },
        completedTasks: {
            type: Number,
            default: 0
        },
        // Kept for backward compatibility with old payloads
        stageStatuses: {
            type: Map,
            of: {
                progress: Number,
                completed: Boolean,
                totalTasks: Number,
                completedTasks: Number
            },
            default: {}
        },
        updatedBy: {
            type: String,
            default: ''
        }
    }

}, { timestamps: true })

projectSchema.methods.recalculateProgress = function () {
    const tasks = this.status.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(
        (task) => task.status === 'completed' || task.completed === true
    ).length
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    this.status.overallProgress = overallProgress
    this.status.totalTasks = totalTasks
    this.status.completedTasks = completedTasks
    this.status.stageStatuses = {}
    return this
}

const Project = mongoose.model('ProjectModel', projectSchema, 'usersProject')

module.exports = Project
