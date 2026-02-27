const express = require('express');
const userAuth = require('../middleware/userAuth');
const projectController = require('../controllers/projectController');

const router = express.Router();

// Routes - mapping URLs to controller methods
router.get('/', userAuth, projectController.getMyProjects);
router.get('/stages/workflow', userAuth, projectController.getStageWorkflowNotice);
router.post('/stages/workflow/accept', userAuth, projectController.acceptStageWorkflow);
router.post('/stages/workflow/remind-later', userAuth, projectController.remindStageWorkflowLater);
router.get('/:projectId/status', userAuth, projectController.getMyProjectStatus);
router.patch('/:projectId/status', userAuth, projectController.updateMyProjectStatus);
router.post('/:projectId/stages/:stageId/submit', userAuth, projectController.submitStageProof);

module.exports = router;
