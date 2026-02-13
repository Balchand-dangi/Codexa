const express = require('express')
const userAuth = require('../middleware/userAuth')
const projectController = require('../controllers/projectController')

const projectRouter = express.Router()

// Routes - mapping URLs to controller methods
projectRouter.get("/", userAuth, projectController.getAllProjects)

module.exports = projectRouter
