const User = require('../model/userSchema');
const Projects = require('../model/projectSchema');
const { Like, Comment } = require('../model/projectInteractionSchema');

// Get all users (Admin only) - WITH PAGINATION + SEARCH
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const skip = (page - 1) * limit
        const search = req.query.search

        const query = {}
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i')
            query.$or = [
                { name: regex },
                { email: regex }
            ]
        }

        const [users, totalCount] = await Promise.all([
            User.find(query)
                .select('-password -emailVerifyToken -passwordResetToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ])

        res.status(200).json({
            data: users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount,
                hasMore: page < Math.ceil(totalCount / limit)
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users", error: err.message })
    }
}

// Get all projects (Admin only) - WITH PAGINATION + SEARCH
exports.getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const skip = (page - 1) * limit
        const search = req.query.search

        const query = {}
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i')
            query.$or = [
                { title: regex },
                { email: regex },
                { description: regex },
                { category: regex }
            ]
        }

        const [projects, totalCount] = await Promise.all([
            Projects.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Projects.countDocuments(query)
        ])

        res.status(200).json({
            data: projects,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount,
                hasMore: page < Math.ceil(totalCount / limit)
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch projects", error: err.message })
    }
}


// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user's projects
        await Projects.deleteMany({ email: user.email });

        // Delete user's likes and comments
        await Like.deleteMany({ userEmail: user.email });
        await Comment.deleteMany({ userEmail: user.email });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User and their data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete user", error: err.message });
    }
};


// Delete project (Admin only)
exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Delete associated likes and comments
        await Like.deleteMany({ projectId });
        await Comment.deleteMany({ projectId });

        // Delete project
        await Projects.findByIdAndDelete(projectId);

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete project", error: err.message });
    }
};

// Get dashboard stats (Admin only)
exports.getStats = async (req, res) => {
    try {
        const [totalUsers, totalProjects, totalComments, totalLikes] = await Promise.all([
            User.countDocuments(),
            Projects.countDocuments(),
            Comment.countDocuments(),
            Like.countDocuments()
        ]);

        res.status(200).json({
            totalUsers,
            totalProjects,
            totalComments,
            totalLikes
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch stats", error: err.message });
    }
};


