const User = require('../model/userSchema')
const { getCache, setCache, deleteByPatterns } = require('../utils/cache')
// Get user profile
exports.getMyProfile = async (req, res) => {
    try {
        const userEmail = req.user.email // Get from your auth middleware
        // Fetching user profile
        const cacheKey = `userProfile:${userEmail}`
        const cachedProfile = await getCache(cacheKey)
        if (cachedProfile) {
            return res.json(JSON.parse(cachedProfile))
        }
        const profile = await User.findOne({ email: userEmail }).lean()
        if (!profile) {
            return res.status(404).json({ message: "User profile not found" })
        }
        setCache(cacheKey, JSON.stringify(profile))
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
        const cacheKey = `userProfile:${userEmail}`
        await deleteByPatterns([cacheKey, `myProjects:${userEmail}`]) // Invalidate profile and myProjects cache for this user
        const updatedProfile = await User.findOneAndUpdate(
            { email: userEmail },
            { name, skills, age, college },
            { new: true, runValidators: true }
        ).lean()
        if (!updatedProfile) {
            return res.status(404).json({ message: "User profile not found" })
        }
        setCache(cacheKey, JSON.stringify(updatedProfile))
        res.json(updatedProfile)
    } catch (err) {
        console.error("Error updating user profile:", err)
        res.status(500).json({ message: "Unable to update user profile" })
    }
}


