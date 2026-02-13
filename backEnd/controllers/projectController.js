const Project = require('../model/projectSchema')
const User = require('../model/userSchema')
const { Like, Comment } = require('../model/projectInteractionSchema')
const validProject = require('../utils/validateProject')

// Get all projects with stats
exports.getAllProjects = async (req, res) => {
    try {
        const userEmail = req.user.email // Get from your auth middleware
        
        // Fetch all projects
        const projects = await Project.find().lean()
        
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
}

// Upload a new project
exports.uploadProject = async (req, res) => {
    try {
        const userExit = await User.findOne({email:req.body.email })
        if(!userExit){
            return res.status(401).send({message:"Unauthorized ! Please log in first"})
        }
        const error = validProject(req.body)
        if(error){
            return res.status(400).json({message:error})
        }
        const existingProject = await Project.findOne({title:req.body.title ,description:req.body.description})
        if(existingProject){
            return res.json({message:"This project already uploaded"})
        }
        await Project.create(req.body)
        res.status(200).json({message:"Project successfully uploaded"})
    }
    catch(err){
        res.send(err.message)
    }
}

// Get user's own projects
exports.getMyProjects = async (req, res) => {
    try {
        const userEmail = req.user.email; // From JWT payload
        
        const myProjects = await Project.find({ email: userEmail })
            .sort({ createdAt: -1 })
            .lean();

        res.json(myProjects);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
}


