const express = require('express')
const {rate_limiter_light,rate_limiter_strict} = require('../middleware/rate_limiter')
const projectInteractionController = require('../controllers/projectInteractionController')

const router = express.Router()

// Routes - mapping URLs to controller methods
router.post('/like/:projectId',rate_limiter_light, projectInteractionController.likeProject)
router.delete('/unlike/:projectId',rate_limiter_light, projectInteractionController.unlikeProject)
router.get('/likes/:projectId',rate_limiter_light, projectInteractionController.getLikes)
router.post('/comment/:projectId', rate_limiter_strict, projectInteractionController.addComment)
router.get('/comments/:projectId',rate_limiter_light, projectInteractionController.getComments)
router.delete('/comment/:commentId',rate_limiter_strict, projectInteractionController.deleteComment)
router.post('/collaborate/:projectId', rate_limiter_strict, projectInteractionController.sendCollaborationRequest)
router.get('/collaboration-requests',rate_limiter_light, projectInteractionController.getCollaborationRequests)

module.exports = router