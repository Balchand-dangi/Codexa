
const myprofile = require('../model/userSchema')
const express = require('express')
const userAuth = require('../middleware/userAuth')

const myprofileRouter = express.Router()


myprofileRouter.get("/", userAuth, async(req, res) => {
    try {
        const userEmail = req.user.email // Get from your auth middleware
        // Fetching user profile
        const profile = await myprofile.findOne({ email: userEmail }).lean()
        if (!profile) {
            return res.status(404).json({ message: "User profile not found" })
        }
        res.json(profile)
        
    } catch (err) {
        console.error("Error fetching user profile:", err)
        res.status(500).json({ message: "Unable to fetch user profile" })
    }
})


module.exports = myprofileRouter;
