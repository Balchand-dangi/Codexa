const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema(
    {
        stageId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        guidelines: {
            type: String,
            default: '',
            trim: true
        },
        timelineType: {
            type: String,
            enum: ['range', 'duration'],
            default: 'range'
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        durationDays: {
            type: Number,
            default: null
        },
        marks: {
            type: Number,
            required: true,
            min: 0
        },
        order: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const projectStageConfigSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: 'global-project-stages'
        },
        version: {
            type: Number,
            default: 1,
            min: 1
        },
        stages: {
            type: [stageSchema],
            default: []
        },
        updatedBy: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

const ProjectStageConfig = mongoose.model('ProjectStageConfig', projectStageConfigSchema, 'projectStageConfigs');

module.exports = ProjectStageConfig;
