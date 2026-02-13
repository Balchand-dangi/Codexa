const express = require('express')
const userAuth = require('../middleware/userAuth')
const userController = require('../controllers/userController')

const myprofileRouter = express.Router()

// Routes - mapping URLs to controller methods
myprofileRouter.get("/", userAuth, userController.getMyProfile)

module.exports = myprofileRouter
