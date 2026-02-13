const express = require('express')
const projectController = require('../controllers/projectController')

const uploadRouter = express.Router()

// Routes - mapping URLs to controller methods
uploadRouter.post('/', projectController.uploadProject)

module.exports = uploadRouter
  