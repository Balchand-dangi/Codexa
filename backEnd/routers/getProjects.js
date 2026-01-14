const express = require('express')
const Projects = require('../model/projectSchema')
const { Like, Comment } = require('../model/projectInteractionSchema')
const userAuth = require('../middleware/userAuth')

const projectRouter = express.Router()

projectRouter.get("/", userAuth, async(req, res) => {
    try {
        const userEmail = req.user.email // Get from your auth middleware
        
        // Fetch all projects
        const projects = await Projects.find().lean()
        
        // Get all project IDs
        const projectIds = projects.map(p => p._id)
        
        // Fetch likes and comments for all projects in parallel
        const [allLikes, allComments] = await Promise.all([
            Like.find({ projectId: { $in: projectIds } }).lean(),
            Comment.find({ projectId: { $in: projectIds } }).lean()
        ])
        
        // Group likes and comments by projectId
        const likesMap = {}
        const commentsMap = {}
        
        allLikes.forEach(like => {
            const id = like.projectId.toString()
            if (!likesMap[id]) likesMap[id] = []
            likesMap[id].push(like)
        })
        
        allComments.forEach(comment => {
            const id = comment.projectId.toString()
            if (!commentsMap[id]) commentsMap[id] = []
            commentsMap[id].push(comment)
        })
        
        // Add stats to each project
        const projectsWithStats = projects.map(project => {
            const projectId = project._id.toString()
            const projectLikes = likesMap[projectId] || []
            const projectComments = commentsMap[projectId] || []
            
            return {
                ...project,
                likesCount: projectLikes.length,
                commentsCount: projectComments.length,
                userLiked: projectLikes.some(like => like.userEmail === userEmail),
                comments: projectComments
            }
        })
        
        res.json(projectsWithStats)
    }
    catch(err) {
        console.error("Error fetching projects:", err)
        res.status(500).json({ message: "Unable to fetch data from DB" })
    }
})

module.exports = projectRouter
