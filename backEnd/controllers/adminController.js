const mongoose = require('mongoose');
const User = require('../model/userSchema');
const Projects = require('../model/projectSchema');
const Notification = require('../model/notificationSchema');
const ProjectStageConfig = require('../model/projectStageSchema');
const { Like, Comment } = require('../model/projectInteractionSchema');
const { getIO } = require('../socket');
const { getCache, setCache, deleteByPattern, deleteByPatterns, deleteKeys } = require('../utils/cache');

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

const normalizeStageInput = (payload = {}, orderFallback = 0) => {
    const timelineType = payload.timelineType === 'duration' ? 'duration' : 'range';
    const title = String(payload.title || '').trim();
    const description = String(payload.description || '').trim();
    const guidelines = String(payload.guidelines || '').trim();
    const marks = Number(payload.marks);
    const durationDays = payload.durationDays == null ? null : Number(payload.durationDays);
    const startDate = payload.startDate ? new Date(payload.startDate) : null;
    const endDate = payload.endDate ? new Date(payload.endDate) : null;

    if (!title) return { error: 'Stage title is required' };
    if (!Number.isFinite(marks) || marks < 0) return { error: 'Marks must be a valid non-negative number' };

    if (timelineType === 'range') {
        if (!startDate || Number.isNaN(startDate.getTime())) return { error: 'Valid start date is required for range timeline' };
        if (!endDate || Number.isNaN(endDate.getTime())) return { error: 'Valid end date is required for range timeline' };
        if (endDate.getTime() < startDate.getTime()) return { error: 'End date cannot be before start date' };
    } else {
        if (!Number.isFinite(durationDays) || durationDays <= 0) {
            return { error: 'Duration days must be a positive number for duration timeline' };
        }
    }

    return {
        value: {
            title,
            description,
            guidelines,
            marks,
            timelineType,
            startDate: timelineType === 'range' ? startDate : null,
            endDate: timelineType === 'range' ? endDate : null,
            durationDays: timelineType === 'duration' ? durationDays : null,
            order: Number.isFinite(Number(payload.order)) ? Number(payload.order) : orderFallback
        }
    };
};

const createStageId = () => `stage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const clearFeedCache = async () => deleteByPattern('FEED:*');
const clearWorkflowCaches = async () => deleteByPatterns(['WORKFLOW_NOTICE:*', 'MY_PROJECT_STATUS:*']);
const buildAdminUsersCacheKey = ({ page, limit, search }) => `ADMIN_USERS:${page}:${limit}:${search || 'none'}`;
const buildAdminProjectsCacheKey = ({ page, limit, search }) => `ADMIN_PROJECTS:${page}:${limit}:${search || 'none'}`;

// Get all users (Admin only) - WITH PAGINATION + SEARCH
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const cacheKey = buildAdminUsersCacheKey({ page, limit, search });

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const query = {};
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ name: regex }, { email: regex }];
        }

        const [users, totalCount] = await Promise.all([
            User.find(query)
                .select('-password -emailVerifyToken -passwordResetToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        const response = {
            data: users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasMore: page < Math.ceil(totalCount / limit)
            }
        };

        await setCache(cacheKey, JSON.stringify(response), 900);
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
};

// Get all projects (Admin only) - WITH PAGINATION + SEARCH + TEAM MEMBERS
exports.getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const cacheKey = buildAdminProjectsCacheKey({ page, limit, search });

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const matchQuery = {};
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            matchQuery.$or = [{ title: regex }, { email: regex }, { description: regex }, { category: regex }];
        }

        const [result] = await Projects.aggregate([
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'collaborationRequests',
                                let: { pid: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$$pid', '$projectId'] },
                                            status: 'accepted'
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            name: '$requesterName',
                                            email: '$requesterEmail'
                                        }
                                    }
                                ],
                                as: 'teamMembers'
                            }
                        }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        const projects = result.data;
        const totalCount = result.totalCount[0]?.count || 0;

        const response = {
            data: projects,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasMore: page < Math.ceil(totalCount / limit)
            }
        };

        await setCache(cacheKey, JSON.stringify(response), 900);
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch projects', error: err.message });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Projects.deleteMany({ email: user.email });
        await Like.deleteMany({ userEmail: user.email });
        await Comment.deleteMany({ userEmail: user.email });
        await User.findByIdAndDelete(userId);
        await deleteByPatterns([
            'FEED:*',
            `MY_PROJECTS:${user.email}:*`,
            `MY_PROJECT_STATUS:${user.email}:*`,
            `WORKFLOW_NOTICE:${user.email}`,
            'ADMIN_USERS:*',
            'ADMIN_PROJECTS:*'
        ]);

        // Notify all connected clients so home feed refreshes automatically
        const io = getIO();
        if (io) io.emit('feed-invalidated');

        res.status(200).json({ message: 'User and their data deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
};

// Delete project (Admin only)
exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Projects.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await Like.deleteMany({ projectId });
        await Comment.deleteMany({ projectId });
        await Projects.findByIdAndDelete(projectId);
        await clearFeedCache();
        if (project.email) {
            await deleteByPatterns([`MY_PROJECTS:${project.email}:*`]);
            await deleteKeys([`MY_PROJECT_STATUS:${project.email}:${projectId}`]);
        }
        await deleteByPattern('ADMIN_PROJECTS:*');

        // Notify all connected clients so home feed refreshes automatically
        const io = getIO();
        if (io) io.emit('feed-invalidated');

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete project', error: err.message });
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
        res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
    }
};

// Get status for any project (Admin only)
exports.getProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        const [project, config] = await Promise.all([Projects.findById(projectId).lean(), ensureStageConfig()]);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const status = project.status || {};
        const owner = project.email
            ? await User.findOne({ email: project.email }).select('workflowAcceptedVersion').lean()
            : null;
        const acceptedVersion = typeof owner?.workflowAcceptedVersion === 'number' ? owner.workflowAcceptedVersion : 0;

        res.status(200).json({
            projectId: project._id,
            projectTitle: project.title,
            workflow: {
                currentVersion: config.version,
                acceptedVersion,
                isActive: acceptedVersion >= config.version
            },
            globalStages: toSafeStages(config.stages),
            status: {
                tasks: Array.isArray(status.tasks) ? status.tasks : [],
                overallProgress: typeof status.overallProgress === 'number' ? status.overallProgress : 0,
                totalTasks: typeof status.totalTasks === 'number' ? status.totalTasks : 0,
                completedTasks: typeof status.completedTasks === 'number' ? status.completedTasks : 0,
                stageStatuses: status.stageStatuses || {},
                stageSubmissions: Array.isArray(status.stageSubmissions) ? status.stageSubmissions : []
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch project status', error: err.message });
    }
};

// Get global project stages (Admin)
exports.getProjectStages = async (req, res) => {
    try {
        const config = await ensureStageConfig();
        res.status(200).json({
            version: config.version,
            stages: toSafeStages(config.stages)
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch project stages', error: error.message });
    }
};

// Create global stage (Admin)
exports.createProjectStage = async (req, res) => {
    try {
        const config = await ensureStageConfig();
        const parsed = normalizeStageInput(req.body, config.stages.length);
        if (parsed.error) return res.status(400).json({ message: parsed.error });

        config.stages.push({
            stageId: createStageId(),
            ...parsed.value
        });
        config.version += 1;
        config.updatedBy = req.user.email;
        config.stages = config.stages.map((stage, idx) => ({ ...stage.toObject(), order: idx }));
        await config.save();
        await clearWorkflowCaches();

        res.status(201).json({
            message: 'Stage created successfully',
            version: config.version,
            stages: toSafeStages(config.stages)
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create stage', error: error.message });
    }
};

// Update global stage (Admin)
exports.updateProjectStage = async (req, res) => {
    try {
        const { stageId } = req.params;
        const config = await ensureStageConfig();
        const stageIndex = (config.stages || []).findIndex(stage => stage.stageId === stageId);

        if (stageIndex < 0) {
            return res.status(404).json({ message: 'Stage not found' });
        }

        const parsed = normalizeStageInput(req.body, config.stages[stageIndex].order || stageIndex);
        if (parsed.error) return res.status(400).json({ message: parsed.error });

        const current = config.stages[stageIndex];
        config.stages[stageIndex] = {
            ...current.toObject(),
            ...parsed.value,
            stageId: current.stageId
        };

        config.version += 1;
        config.updatedBy = req.user.email;
        await config.save();
        await clearWorkflowCaches();

        res.status(200).json({
            message: 'Stage updated successfully',
            version: config.version,
            stages: toSafeStages(config.stages)
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update stage', error: error.message });
    }
};

// Delete global stage (Admin)
exports.deleteProjectStage = async (req, res) => {
    try {
        const { stageId } = req.params;
        const config = await ensureStageConfig();

        const nextStages = (config.stages || []).filter(stage => stage.stageId !== stageId);
        if (nextStages.length === (config.stages || []).length) {
            return res.status(404).json({ message: 'Stage not found' });
        }

        config.stages = nextStages.map((stage, idx) => ({ ...stage.toObject(), order: idx }));
        config.version += 1;
        config.updatedBy = req.user.email;
        await config.save();
        await clearWorkflowCaches();

        res.status(200).json({
            message: 'Stage deleted successfully',
            version: config.version,
            stages: toSafeStages(config.stages)
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete stage', error: error.message });
    }
};

// Reorder global stages (Admin)
exports.reorderProjectStages = async (req, res) => {
    try {
        const { orderedStageIds } = req.body;
        if (!Array.isArray(orderedStageIds) || orderedStageIds.length === 0) {
            return res.status(400).json({ message: 'orderedStageIds must be a non-empty array' });
        }

        const config = await ensureStageConfig();
        const currentStages = config.stages || [];
        if (orderedStageIds.length !== currentStages.length) {
            return res.status(400).json({ message: 'orderedStageIds length must match existing stages' });
        }

        const byId = new Map(currentStages.map(stage => [stage.stageId, stage]));
        const reordered = [];
        for (let i = 0; i < orderedStageIds.length; i += 1) {
            const id = orderedStageIds[i];
            if (!byId.has(id)) {
                return res.status(400).json({ message: `Invalid stage id in reorder list: ${id}` });
            }
            reordered.push({ ...byId.get(id).toObject(), order: i });
        }

        config.stages = reordered;
        config.version += 1;
        config.updatedBy = req.user.email;
        await config.save();
        await clearWorkflowCaches();

        res.status(200).json({
            message: 'Stages reordered successfully',
            version: config.version,
            stages: toSafeStages(config.stages)
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reorder stages', error: error.message });
    }
};

// Admin review queue for stage submissions
exports.getStageSubmissionReviews = async (req, res) => {
    try {
        const statusFilter = req.query.status || 'pending';
        const allowed = new Set(['pending', 'approved', 'rejected', 'all']);
        if (!allowed.has(statusFilter)) {
            return res.status(400).json({ message: 'Invalid status filter' });
        }

        const projects = await Projects.find(
            statusFilter === 'all'
                ? { 'status.stageSubmissions.0': { $exists: true } }
                : { 'status.stageSubmissions.status': statusFilter }
        )
            .select('title email status.stageSubmissions')
            .lean();

        const reviews = [];
        projects.forEach(project => {
            const submissions = project?.status?.stageSubmissions || [];
            submissions.forEach(submission => {
                if (statusFilter !== 'all' && submission.status !== statusFilter) return;
                reviews.push({
                    projectId: project._id,
                    projectTitle: project.title,
                    projectOwnerEmail: project.email,
                    ...submission
                });
            });
        });

        reviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch review queue', error: error.message });
    }
};

// Approve stage submission
exports.approveStageSubmission = async (req, res) => {
    try {
        const { projectId, stageId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        const project = await Projects.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const submissions = project?.status?.stageSubmissions || [];
        const index = submissions.findIndex(sub => sub.stageId === stageId);
        if (index < 0) return res.status(404).json({ message: 'Submission not found for stage' });

        submissions[index].status = 'approved';
        submissions[index].adminFeedback = '';
        submissions[index].reviewedBy = req.user.email;
        submissions[index].reviewedAt = new Date();

        await project.save();
        await deleteKeys([`MY_PROJECT_STATUS:${project.email}:${projectId}`]);

        const ownerEmail = project.email;
        const adminName = req.user.name || 'Admin';
        const notification = await Notification.create({
            recipient: ownerEmail,
            sender: req.user.email,
            senderName: adminName,
            projectId: project._id,
            projectTitle: project.title,
            type: 'stage_submission_result',
            message: `Your "${submissions[index].stageTitle}" submission was approved`
        });

        const io = getIO();
        if (io) {
            await deleteKeys([`notifications:${ownerEmail}`]).catch(() => { });
            io.to(`user:${ownerEmail}`).emit('new-notification', notification);
        }

        res.status(200).json({
            message: 'Stage submission approved',
            stageSubmission: submissions[index]
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve submission', error: error.message });
    }
};

// Reject stage submission
exports.rejectStageSubmission = async (req, res) => {
    try {
        const { projectId, stageId } = req.params;
        const { feedback } = req.body;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        const project = await Projects.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const submissions = project?.status?.stageSubmissions || [];
        const index = submissions.findIndex(sub => sub.stageId === stageId);
        if (index < 0) return res.status(404).json({ message: 'Submission not found for stage' });

        submissions[index].status = 'rejected';
        submissions[index].adminFeedback = String(feedback || '').trim();
        submissions[index].reviewedBy = req.user.email;
        submissions[index].reviewedAt = new Date();

        await project.save();
        await deleteKeys([`MY_PROJECT_STATUS:${project.email}:${projectId}`]);

        const ownerEmail = project.email;
        const adminName = req.user.name || 'Admin';
        const notification = await Notification.create({
            recipient: ownerEmail,
            sender: req.user.email,
            senderName: adminName,
            projectId: project._id,
            projectTitle: project.title,
            type: 'stage_submission_result',
            message: `Your "${submissions[index].stageTitle}" submission was rejected`
        });

        const io = getIO();
        if (io) {
            await deleteKeys([`notifications:${ownerEmail}`]).catch(() => { });
            io.to(`user:${ownerEmail}`).emit('new-notification', notification);
        }

        res.status(200).json({
            message: 'Stage submission rejected',
            stageSubmission: submissions[index]
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject submission', error: error.message });
    }
};
