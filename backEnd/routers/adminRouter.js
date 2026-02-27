const express = require('express');
const adminRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Routes - mapping URLs to controller methods
adminRouter.get('/users', adminMiddleware, adminController.getAllUsers);
adminRouter.delete('/users/:userId', adminMiddleware, adminController.deleteUser);
adminRouter.get('/projects', adminMiddleware, adminController.getAllProjects);
adminRouter.get('/projects/:projectId/status', adminMiddleware, adminController.getProjectStatus);
adminRouter.delete('/projects/:projectId', adminMiddleware, adminController.deleteProject);
adminRouter.get('/project-stages', adminMiddleware, adminController.getProjectStages);
adminRouter.post('/project-stages', adminMiddleware, adminController.createProjectStage);
adminRouter.put('/project-stages/:stageId', adminMiddleware, adminController.updateProjectStage);
adminRouter.delete('/project-stages/:stageId', adminMiddleware, adminController.deleteProjectStage);
adminRouter.patch('/project-stages/reorder', adminMiddleware, adminController.reorderProjectStages);
adminRouter.get('/stage-submissions', adminMiddleware, adminController.getStageSubmissionReviews);
adminRouter.patch('/stage-submissions/:projectId/:stageId/approve', adminMiddleware, adminController.approveStageSubmission);
adminRouter.patch('/stage-submissions/:projectId/:stageId/reject', adminMiddleware, adminController.rejectStageSubmission);
adminRouter.get('/stats', adminMiddleware, adminController.getStats);

module.exports = adminRouter;
