const express = require('express');
const userAuth = require('../middleware/userAuth');
const projectController = require('../controllers/projectController');

const router = express.Router();

// Routes - mapping URLs to controller methods
router.get('/', userAuth, projectController.getMyProjects);

module.exports = router;
