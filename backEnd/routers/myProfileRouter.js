const express = require('express')
const userAuth = require('../middleware/userAuth')
const userController = require('../controllers/userController')

const myprofileRouter = express.Router()

// Routes - mapping URLs to controller methods
myprofileRouter.get("/getMyProfile", userAuth, userController.getMyProfile)

myprofileRouter.patch("/updateMyProfile", userAuth, userController.updateMyProfile)

module.exports = myprofileRouter
