// Here I'm verifying that user exists in my database

const jwt = require('jsonwebtoken');
const User = require("../model/userSchema");
const redisClient = require('../config/redis');

const userAuth = async (req, res, next) => {
    try {
        // 1. Get token from cookies
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: "Token doesn't exist! plz sign in" });
        }

        // 2. Verify token
        const payload = jwt.verify(token, process.env.SECRET_KEY);

        // 3. Check if user exists in DB
        const result = await User.findById(payload._id);
        if (!result) {
            return res.status(401).json({ error: "User not found!" });
        }

        // 4. Check Redis blocklist
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            return res.status(401).json({ error: "Token blocked! Please login again." });
        }

        // 5. Attach user info to request
        req.user = result;  
        next();

    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

module.exports = userAuth;
