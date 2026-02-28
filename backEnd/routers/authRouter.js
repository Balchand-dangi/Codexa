const express = require('express')
const userAuth = require('../middleware/userAuth')
const rate_limiter = require('../middleware/rate_limiter')
const authController = require('../controllers/authController')

const authRouter = express.Router()

// Routes - mapping URLs to controller methods
authRouter.get("/verify", userAuth, authController.verify)
authRouter.post("/signUp",  authController.signUp)
authRouter.get("/verify-email/:token", authController.verifyEmail)
authRouter.post('/signIn',  authController.signIn)
authRouter.post("/logOut", authController.logOut)
authRouter.post("/forgot-password",  authController.forgotPassword)
authRouter.post("/reset-password/:token", authController.resetPassword)

module.exports = authRouter