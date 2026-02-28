const express = require('express');
const projectController = require('../controllers/projectController');

const router = express.Router();

// Routes - mapping URLs to controller methods
router.get('/',  projectController.getMyProjects);
router.get('/stages/workflow',  projectController.getStageWorkflowNotice);
router.post('/stages/workflow/accept',  projectController.acceptStageWorkflow);
router.post('/stages/workflow/remind-later',  projectController.remindStageWorkflowLater);
router.get('/:projectId/status',  projectController.getMyProjectStatus);
router.patch('/:projectId/status',  projectController.updateMyProjectStatus);
router.post('/:projectId/stages/:stageId/submit',  projectController.submitStageProof);

module.exports = router;
