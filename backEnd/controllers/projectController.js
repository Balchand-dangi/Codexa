const Project = require('../model/projectSchema')
const User = require('../model/userSchema')
const { Like, Comment } = require('../model/projectInteractionSchema')
const validProject = require('../utils/validateProject')
const mongoose = require('mongoose')

// Get all projects with stats (CURSOR-BASED PAGINATION for feed)
exports.getAllProjects = async (req, res) => {
    try {
        const userEmail = req.user.email
        const limit = parseInt(req.query.limit) || 21
        const cursor = req.query.cursor
        const search = req.query.search

        // Build query — cursor for pagination
        const query = cursor ? { _id: { $lt: cursor } } : {}

        // Flexible search: match title, description, category, or techStack (case-insensitive)
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i')
            query.$or = [
                { title: regex },
                { description: regex },
                { category: regex },
                { techStack: regex }
            ]
        }

        // Fetch projects (fetch one extra to check if more exist)
        const projects = await Project.find(query)
            .sort({ _id: -1 }) // Newest first
            .limit(limit + 1)
            .lean()

        // Check if more projects exist
        const hasMore = projects.length > limit
        const results = hasMore ? projects.slice(0, limit) : projects

        // Get all project IDs
        const projectIds = results.map(p => p._id)

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
        const projectsWithStats = results.map(project => {
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

        res.json({
            data: projectsWithStats,
            pagination: {
                hasMore: hasMore,
                nextCursor: hasMore ? results[results.length - 1]._id : null
            }
        })
    }
    catch (err) {
        console.error("Error fetching projects:", err)
        res.status(500).json({ message: "Unable to fetch data from DB" })
    }
}


// Get user's own projects (OFFSET-BASED PAGINATION)
exports.getMyProjects = async (req, res) => {
    try {
        const userEmail = req.user.email
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        // Fetch projects with pagination
        const [myProjects, totalCount] = await Promise.all([
            Project.find({ email: userEmail })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Project.countDocuments({ email: userEmail })
        ])

        res.json({
            data: myProjects,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount,
                hasMore: page < Math.ceil(totalCount / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching user projects:', error)
        res.status(500).json({ message: 'Failed to fetch projects' })
    }
}

// Upload a new project
exports.uploadProject = async (req, res) => {
    try {
        const userExit = await User.findOne({ email: req.body.email })
        if (!userExit) {
            return res.status(401).send({ message: "Unauthorized ! Please log in first" })
        }
        const error = validProject(req.body)
        if (error) {
            return res.status(400).json({ message: error })
        }
        const existingProject = await Project.findOne({ title: req.body.title, description: req.body.description })
        if (existingProject) {
            return res.json({ message: "This project already uploaded" })
        }
        await Project.create(req.body)
        res.status(200).json({ message: "Project successfully uploaded" })
    }
    catch (err) {
        res.send(err.message)
    }
}

// Get status for a single user-owned project
exports.getMyProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params
        const userEmail = req.user.email

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' })
        }

        const project = await Project.findOne({ _id: projectId, email: userEmail }).lean()
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        const status = project.status || {}

        res.status(200).json({
            projectId: project._id,
            projectTitle: project.title,
            status: {
                tasks: Array.isArray(status.tasks) ? status.tasks : [],
                overallProgress: typeof status.overallProgress === 'number' ? status.overallProgress : 0,
                totalTasks: typeof status.totalTasks === 'number' ? status.totalTasks : 0,
                completedTasks: typeof status.completedTasks === 'number' ? status.completedTasks : 0,
                stageStatuses: status.stageStatuses || {}
            }
        })
    } catch (error) {
        console.error('Error fetching project status:', error)
        res.status(500).json({ message: 'Failed to fetch project status' })
    }
}

// Update status for a single user-owned project
exports.updateMyProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params
        const userEmail = req.user.email
        const { tasks } = req.body

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' })
        }

        if (!Array.isArray(tasks)) {
            return res.status(400).json({ message: 'tasks must be an array' })
        }

        const validStatuses = new Set(['todo', 'in-progress', 'completed'])
        const validPriorities = new Set(['low', 'medium', 'high'])

        const normalizedTasks = tasks.map((task, index) => {
            const safeStatus = validStatuses.has(task?.status) ? task.status : (task?.completed ? 'completed' : 'todo')
            const safePriority = validPriorities.has(task?.priority) ? task.priority : 'medium'

            return {
                id: String(task?.id || `${Date.now()}-${index}`),
                title: String(task?.title || '').trim(),
                description: String(task?.description || '').trim(),
                priority: safePriority,
                status: safeStatus,
                dueDate: task?.dueDate ? new Date(task.dueDate) : null,
                createdAt: task?.createdAt ? new Date(task.createdAt) : new Date()
            }
        }).filter(task =>
            task.title.length > 0 &&
            !Number.isNaN(task.createdAt.getTime()) &&
            (task.dueDate === null || !Number.isNaN(task.dueDate.getTime()))
        )

        const project = await Project.findOne({ _id: projectId, email: userEmail })
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        if (!project.status) {
            project.status = {}
        }

        project.status.tasks = normalizedTasks
        project.status.updatedBy = userEmail
        project.recalculateProgress()

        await project.save()

        res.status(200).json({
            message: 'Project status updated successfully',
            status: {
                tasks: project.status.tasks,
                overallProgress: project.status.overallProgress,
                totalTasks: project.status.totalTasks,
                completedTasks: project.status.completedTasks,
                stageStatuses: project.status.stageStatuses
            }
        })
    } catch (error) {
        console.error('Error updating project status:', error)
        res.status(500).json({ message: 'Failed to update project status' })
    }
}




