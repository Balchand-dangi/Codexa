const mongoose = require('mongoose');
const Project = require('../model/projectSchema');
const User = require('../model/userSchema');
const Notification = require('../model/notificationSchema');
const ProjectStageConfig = require('../model/projectStageSchema');
const { Like, Comment } = require('../model/projectInteractionSchema');
const validProject = require('../utils/validateProject');
const { getIO } = require('../socket');
const { getCache, setCache, deleteByPatterns, deleteKeys } = require('../utils/cache');

const GLOBAL_STAGE_KEY = 'global-project-stages';

const ensureStageConfig = async () => {
    const existing = await ProjectStageConfig.findOne({ key: GLOBAL_STAGE_KEY });
    if (existing) return existing;

    return ProjectStageConfig.create({
        key: GLOBAL_STAGE_KEY,
        version: 1,
        stages: [],
        updatedBy: ''
    });
};

const toSafeStages = (stages = []) =>
    stages
        .map(stage => ({
            stageId: stage.stageId,
            title: stage.title,
            description: stage.description || '',
            guidelines: stage.guidelines || '',
            timelineType: stage.timelineType || 'range',
            startDate: stage.startDate || null,
            endDate: stage.endDate || null,
            durationDays: typeof stage.durationDays === 'number' ? stage.durationDays : null,
            marks: typeof stage.marks === 'number' ? stage.marks : 0,
            order: typeof stage.order === 'number' ? stage.order : 0
        }))
        .sort((a, b) => a.order - b.order);

const buildFeedCacheKey = ({ cursor, search }) => `FEED:${cursor || 'first'}:${search || 'none'}`;
const buildMyProjectsCacheKey = ({ userEmail, page, limit }) => `MY_PROJECTS:${userEmail}:${page}:${limit}`;
const buildWorkflowNoticeCacheKey = userEmail => `WORKFLOW_NOTICE:${userEmail}`;
const buildProjectStatusCacheKey = ({ userEmail, projectId }) => `MY_PROJECT_STATUS:${userEmail}:${projectId}`;

// Get all projects with stats (CURSOR-BASED PAGINATION for feed)
exports.getAllProjects = async (req, res) => {
    try {
        const userEmail = req.user.email
        const limit = parseInt(req.query.limit, 10) || 21
        const cursor = req.query.cursor
        const search = req.query.search

        const cacheKey = buildFeedCacheKey({ cursor, search })

        // CACHE HIT
        const cached = await getCache(cacheKey)
        if (cached) {
            const parsed = JSON.parse(cached)
            //console.log('Cache hit for key:', cacheKey)

            // only userLiked is dynamic
            parsed.data.forEach(project => {
                project.userLiked = project.likes.some(
                    like => like.userEmail === userEmail
                )
                delete project.likes
            })

            return res.json(parsed)
        }

        //  ORIGINAL DB LOGIC

        const query = cursor ? { _id: { $lt: cursor } } : {}

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i')
            query.$or = [
                { title: regex },
                { description: regex },
                { category: regex },
                { techStack: regex }
            ]
        }

        const projects = await Project.find(query)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean()
        //console.log('DB HIT:', cacheKey)

        const hasMore = projects.length > limit
        const results = hasMore ? projects.slice(0, limit) : projects
        const projectIds = results.map(p => p._id)

        const [allLikes, allComments] = await Promise.all([
            Like.find({ projectId: { $in: projectIds } }).lean(),
            Comment.find({ projectId: { $in: projectIds } }).lean()
        ])

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

        const projectsWithStats = results.map(project => {
            const projectId = project._id.toString()
            const projectLikes = likesMap[projectId] || []
            const projectComments = commentsMap[projectId] || []

            return {
                ...project,
                likes: projectLikes, // store temporarily for userLiked
                likesCount: projectLikes.length,
                commentsCount: projectComments.length,
                comments: projectComments
            }
        })

        const response = {
            data: projectsWithStats,
            pagination: {
                hasMore,
                nextCursor: hasMore
                    ? results[results.length - 1]._id
                    : null
            }
        }

        // STORE IN CACHE (without userLiked)
        await setCache(cacheKey, JSON.stringify(response), 900)

        // ADD userLiked before sending
        response.data.forEach(project => {
            project.userLiked = project.likes.some(
                like => like.userEmail === userEmail
            )
            delete project.likes
        })

        res.json(response)

    } catch (err) {
        console.error('Error fetching projects:', err)
        res.status(500).json({ message: 'Unable to fetch data from DB' })
    }
}

// Get user's own projects (OFFSET-BASED PAGINATION)
exports.getMyProjects = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const cacheKey = buildMyProjectsCacheKey({ userEmail, page, limit });

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const [myProjects, totalCount] = await Promise.all([
            Project.find({ email: userEmail })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Project.countDocuments({ email: userEmail })
        ]);

        const response = {
            data: myProjects,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasMore: page < Math.ceil(totalCount / limit)
            }
        };

        await setCache(cacheKey, JSON.stringify(response), 300);
        res.json(response);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
};

// Upload a new project
exports.uploadProject = async (req, res) => {
    try {
        const userEmail = req.user.email; // authenticated user's email
        const userExists = await User.findOne({ email: userEmail });
        if (!userExists) {
            return res.status(401).send({ message: 'Unauthorized ! Please log in first' });
        }
        // Force project email to match the authenticated user — ignore any client-provided email
        const projectData = { ...req.body, email: userEmail };
        const error = validProject(projectData, userEmail);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const existingProject = await Project.findOne({ title: projectData.title, description: projectData.description });
        if (existingProject) {
            return res.json({ message: 'This project already uploaded' });
        }
        await Project.create(projectData);
        await deleteByPatterns([
            'FEED:*',
            `MY_PROJECTS:${userEmail}:*`,
            'ADMIN_PROJECTS:*'
        ]);
        res.status(200).json({ message: 'Project successfully uploaded' });
    } catch (err) {
        res.send(err.message);
    }
};

// Get stage workflow notice shown on next visit
exports.getStageWorkflowNotice = async (req, res) => {
    try {
        const cacheKey = buildWorkflowNoticeCacheKey(req.user.email);
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const config = await ensureStageConfig();
        const user = req.user;
        const now = new Date();
        const acceptedVersion = typeof user.workflowAcceptedVersion === 'number' ? user.workflowAcceptedVersion : 0;
        const remindLaterUntil = user.workflowRemindLaterUntil || null;
        const hasPendingWorkflowUpdate = acceptedVersion < config.version;
        const shouldPrompt =
            hasPendingWorkflowUpdate &&
            (!remindLaterUntil || new Date(remindLaterUntil).getTime() <= now.getTime());

        const response = {
            workflow: {
                currentVersion: config.version,
                acceptedVersion,
                remindLaterUntil,
                hasPendingWorkflowUpdate,
                shouldPrompt,
                stages: toSafeStages(config.stages)
            }
        };

        await setCache(cacheKey, JSON.stringify(response), 300);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching stage workflow notice:', error);
        res.status(500).json({ message: 'Failed to fetch stage workflow notice' });
    }
};

exports.acceptStageWorkflow = async (req, res) => {
    try {
        const config = await ensureStageConfig();
        req.user.workflowAcceptedVersion = config.version;
        req.user.workflowRemindLaterUntil = null;
        await req.user.save();
        await deleteKeys([buildWorkflowNoticeCacheKey(req.user.email)]);

        res.status(200).json({
            message: 'Workflow accepted successfully',
            acceptedVersion: req.user.workflowAcceptedVersion
        });
    } catch (error) {
        console.error('Error accepting workflow:', error);
        res.status(500).json({ message: 'Failed to accept workflow' });
    }
};

exports.remindStageWorkflowLater = async (req, res) => {
    try {
        const remindAfterHours = 24;
        const remindLaterUntil = new Date(Date.now() + remindAfterHours * 60 * 60 * 1000);
        req.user.workflowRemindLaterUntil = remindLaterUntil;
        await req.user.save();
        await deleteKeys([buildWorkflowNoticeCacheKey(req.user.email)]);

        res.status(200).json({
            message: 'Reminder saved',
            remindLaterUntil
        });
    } catch (error) {
        console.error('Error setting remind later:', error);
        res.status(500).json({ message: 'Failed to set reminder' });
    }
};

// Get status for a single user-owned project
exports.getMyProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userEmail = req.user.email;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }
        const cacheKey = buildProjectStatusCacheKey({ userEmail, projectId });
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const [project, config] = await Promise.all([
            Project.findOne({ _id: projectId, email: userEmail }).lean(),
            ensureStageConfig()
        ]);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const status = project.status || {};
        const stages = toSafeStages(config.stages);

        const response = {
            projectId: project._id,
            projectTitle: project.title,
            workflow: {
                currentVersion: config.version,
                acceptedVersion: req.user.workflowAcceptedVersion || 0,
                isActive: (req.user.workflowAcceptedVersion || 0) >= config.version
            },
            globalStages: stages,
            status: {
                tasks: Array.isArray(status.tasks) ? status.tasks : [],
                overallProgress: typeof status.overallProgress === 'number' ? status.overallProgress : 0,
                totalTasks: typeof status.totalTasks === 'number' ? status.totalTasks : 0,
                completedTasks: typeof status.completedTasks === 'number' ? status.completedTasks : 0,
                stageStatuses: status.stageStatuses || {},
                stageSubmissions: Array.isArray(status.stageSubmissions) ? status.stageSubmissions : []
            }
        };

        await setCache(cacheKey, JSON.stringify(response), 300);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching project status:', error);
        res.status(500).json({ message: 'Failed to fetch project status' });
    }
};

// Update status for a single user-owned project
exports.updateMyProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userEmail = req.user.email;
        const { tasks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        if (!Array.isArray(tasks)) {
            return res.status(400).json({ message: 'tasks must be an array' });
        }

        const validStatuses = new Set(['todo', 'in-progress', 'completed']);
        const validPriorities = new Set(['low', 'medium', 'high']);

        const normalizedTasks = tasks
            .map((task, index) => {
                const safeStatus = validStatuses.has(task?.status) ? task.status : task?.completed ? 'completed' : 'todo';
                const safePriority = validPriorities.has(task?.priority) ? task.priority : 'medium';

                return {
                    id: String(task?.id || `${Date.now()}-${index}`),
                    title: String(task?.title || '').trim(),
                    description: String(task?.description || '').trim(),
                    priority: safePriority,
                    status: safeStatus,
                    dueDate: task?.dueDate ? new Date(task.dueDate) : null,
                    createdAt: task?.createdAt ? new Date(task.createdAt) : new Date()
                };
            })
            .filter(
                task =>
                    task.title.length > 0 &&
                    !Number.isNaN(task.createdAt.getTime()) &&
                    (task.dueDate === null || !Number.isNaN(task.dueDate.getTime()))
            );

        const project = await Project.findOne({ _id: projectId, email: userEmail });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.status) {
            project.status = {};
        }

        project.status.tasks = normalizedTasks;
        project.status.updatedBy = userEmail;
        project.recalculateProgress();

        await project.save();
        await deleteByPatterns([
            `MY_PROJECTS:${userEmail}:*`
        ]);
        await deleteKeys([buildProjectStatusCacheKey({ userEmail, projectId })]);

        res.status(200).json({
            message: 'Project status updated successfully',
            status: {
                tasks: project.status.tasks,
                overallProgress: project.status.overallProgress,
                totalTasks: project.status.totalTasks,
                completedTasks: project.status.completedTasks,
                stageStatuses: project.status.stageStatuses,
                stageSubmissions: project.status.stageSubmissions || []
            }
        });
    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({ message: 'Failed to update project status' });
    }
};

// Submit stage completion proof image (User)
exports.submitStageProof = async (req, res) => {
    try {
        const { projectId, stageId } = req.params;
        const { proofImage } = req.body;
        const userEmail = req.user.email;
        const userName = req.user.name;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        if (!proofImage || typeof proofImage !== 'string' || !proofImage.startsWith('data:image/')) {
            return res.status(400).json({ message: 'Valid proof image is required' });
        }

        const base64Payload = proofImage.split(',')[1] || '';
        const proofSizeBytes = Buffer.byteLength(base64Payload, 'base64');
        const maxProofBytes = 1 * 1024 * 1024;
        if (proofSizeBytes > maxProofBytes) {
            return res.status(400).json({ message: 'Image must be less than 1 MB' });
        }

        const [project, config] = await Promise.all([
            Project.findOne({ _id: projectId, email: userEmail }),
            ensureStageConfig()
        ]);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const stage = (config.stages || []).find(s => s.stageId === stageId);
        if (!stage) {
            return res.status(404).json({ message: 'Stage not found in global workflow' });
        }

        if (!project.status) {
            project.status = {};
        }
        if (!Array.isArray(project.status.stageSubmissions)) {
            project.status.stageSubmissions = [];
        }

        const existingIndex = project.status.stageSubmissions.findIndex(s => s.stageId === stageId);
        const nextPayload = {
            stageId,
            stageTitle: stage.title,
            proofImage,
            status: 'pending',
            adminFeedback: '',
            submittedBy: userEmail,
            submittedAt: new Date(),
            reviewedBy: '',
            reviewedAt: null
        };

        if (existingIndex >= 0) {
            const previous = project.status.stageSubmissions[existingIndex];
            if (previous.status === 'approved') {
                return res.status(400).json({ message: 'Stage already approved' });
            }
            project.status.stageSubmissions[existingIndex] = nextPayload;
        } else {
            project.status.stageSubmissions.push(nextPayload);
        }

        project.status.updatedBy = userEmail;
        await project.save();
        await deleteKeys([buildProjectStatusCacheKey({ userEmail, projectId })]);

        const admins = await User.find({ role: 'admin' }).select('email name').lean();
        const io = getIO();

        if (admins.length > 0) {
            const notificationDocs = admins.map(admin => ({
                recipient: admin.email,
                sender: userEmail,
                senderName: userName,
                projectId: project._id,
                projectTitle: project.title,
                type: 'stage_submission',
                message: `${userName} submitted proof for "${stage.title}" in "${project.title}"`
            }));

            const created = await Notification.insertMany(notificationDocs);
            if (io) {
                created.forEach(notification => {
                    deleteKeys([`notifications:${notification.recipient}`]).catch(() => { })
                    io.to(`user:${notification.recipient}`).emit('new-notification', notification);
                });
            }
        }

        res.status(200).json({
            message: 'Stage proof submitted for admin approval',
            stageSubmission: nextPayload
        });
    } catch (error) {
        console.error('Error submitting stage proof:', error);
        res.status(500).json({ message: 'Failed to submit stage proof' });
    }
};
