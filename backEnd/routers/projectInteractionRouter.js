const express = require('express')
const rate_limiter = require('../middleware/rate_limiter')
const projectInteractionController = require('../controllers/projectInteractionController')

const router = express.Router()

// Routes - mapping URLs to controller methods
router.post('/like/:projectId', projectInteractionController.likeProject)
router.delete('/unlike/:projectId', projectInteractionController.unlikeProject)
router.get('/likes/:projectId', projectInteractionController.getLikes)
router.post('/comment/:projectId', rate_limiter, projectInteractionController.addComment)
router.get('/comments/:projectId', projectInteractionController.getComments)
router.delete('/comment/:commentId', projectInteractionController.deleteComment)
router.post('/collaborate/:projectId', rate_limiter, projectInteractionController.sendCollaborationRequest)
router.get('/collaboration-requests', projectInteractionController.getCollaborationRequests)
router.patch('/collaboration-request/:requestId', projectInteractionController.updateCollaborationRequestStatus)

module.exports = router