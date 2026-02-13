const express = require('express')
const userAuth = require('../middleware/userAuth')
const rate_limiter = require('../middleware/rate_limiter')
const authController = require('../controllers/authController')

const authRouter = express.Router()

// Routes - mapping URLs to controller methods
authRouter.get("/verify", userAuth, authController.verify)
authRouter.post("/signUp", rate_limiter, authController.signUp)
authRouter.get("/verify-email/:token", authController.verifyEmail)
authRouter.post('/signIn', rate_limiter, authController.signIn)
authRouter.post("/logOut", userAuth, authController.logOut)
authRouter.post("/forgot-password", rate_limiter, authController.forgotPassword)
authRouter.post("/reset-password/:token", rate_limiter, authController.resetPassword)

module.exports = authRouter