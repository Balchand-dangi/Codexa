const express = require('express');
const adminRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Routes - mapping URLs to controller methods
adminRouter.get('/users', adminMiddleware, adminController.getAllUsers);
adminRouter.delete('/users/:userId', adminMiddleware, adminController.deleteUser);
adminRouter.get('/projects', adminMiddleware, adminController.getAllProjects);
adminRouter.delete('/projects/:projectId', adminMiddleware, adminController.deleteProject);
adminRouter.get('/stats', adminMiddleware, adminController.getStats);

module.exports = adminRouter;
