const User = require('../model/userSchema')

// Get user profile
exports.getMyProfile = async (req, res) => {
    try {
        const userEmail = req.user.email // Get from your auth middleware
        // Fetching user profile
        const profile = await User.findOne({ email: userEmail }).lean()
        if (!profile) {
            return res.status(404).json({ message: "User profile not found" })
        }
        res.json(profile)
        
    } catch (err) {
        console.error("Error fetching user profile:", err)
        res.status(500).json({ message: "Unable to fetch user profile" })
    }
}

exports.updateMyProfile = async (req, res) => {
    try {
        const userEmail = req.user.email // Get from your auth middleware
        const { name, skills, age, college } = req.body
        // Update user profile
        const updatedProfile = await User.findOneAndUpdate(
            { email: userEmail },
            { name, skills, age, college },
            { new: true, runValidators: true }
        ).lean()
        if (!updatedProfile) {
            return res.status(404).json({ message: "User profile not found" })
        }
        res.json(updatedProfile)
    } catch (err) {
        console.error("Error updating user profile:", err)
        res.status(500).json({ message: "Unable to update user profile" })
    }
}


