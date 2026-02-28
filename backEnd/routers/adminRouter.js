const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');

// Routes - mapping URLs to controller methods
adminRouter.get('/users',  adminController.getAllUsers);
adminRouter.delete('/users/:userId',  adminController.deleteUser);
adminRouter.get('/projects',  adminController.getAllProjects);
adminRouter.get('/projects/:projectId/status',  adminController.getProjectStatus);
adminRouter.delete('/projects/:projectId',  adminController.deleteProject);
adminRouter.get('/project-stages',  adminController.getProjectStages);
adminRouter.post('/project-stages',  adminController.createProjectStage);
adminRouter.put('/project-stages/:stageId',  adminController.updateProjectStage);
adminRouter.delete('/project-stages/:stageId',  adminController.deleteProjectStage);
adminRouter.patch('/project-stages/reorder',  adminController.reorderProjectStages);
adminRouter.get('/stage-submissions',  adminController.getStageSubmissionReviews);
adminRouter.patch('/stage-submissions/:projectId/:stageId/approve',  adminController.approveStageSubmission);
adminRouter.patch('/stage-submissions/:projectId/:stageId/reject',  adminController.rejectStageSubmission);
adminRouter.get('/stats',  adminController.getStats);

module.exports = adminRouter;
