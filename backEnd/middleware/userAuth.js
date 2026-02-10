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

        // Verify token
        const payload = jwt.verify(token, process.env.SECRET_KEY);

        //  Check if user exists in DB
        const result = await User.findById(payload._id);
        //console.log(result);
        if (!result) {
            return res.status(401).json({ error: "User not found!" });
        }

        // Check Redis blocklist
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            return res.status(401).json({ error: "Token blocked! Please login again." });
        }

        //  Attach user info to request
        //console.log("User authenticated by userAuth middleware:", result.email);
        req.user = result;  
        next();

    } catch (err) {
        return res.status(401).json({ error: "Authentication failed" });

    }
};

module.exports = userAuth;
