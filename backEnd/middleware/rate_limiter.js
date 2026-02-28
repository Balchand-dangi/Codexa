const redisClient = require('../config/redis');

const rate_limiter_strict = async (req, res, next) => {
    try {
        const identifier = req.user?.email || req.ip;
        const currentTime = Date.now();
        const windowSize = 3600 * 1000; // 1 hour in milliseconds
        const maxRequests = 30;
        const key = `rate_limit:${identifier}`;

        // Remove entries outside the sliding window
        await redisClient.zRemRangeByScore(key, 0, currentTime - windowSize);

        // Count requests in current window
        const requestCount = await redisClient.zCard(key);

        //console.log(`Strict: Identifier: ${identifier}, Count: ${requestCount}`);

        if (requestCount >= maxRequests) {
            return res.status(429).json({ 
                message: "Too many requests! Please try after some time, Thank you." 
            });
        }

        // Add current request with timestamp as score
        await redisClient.zAdd(key, {
            score: currentTime,
            value: `${currentTime}-${Math.random()}` // Unique value
        });

        // Set expiry for the key (cleanup)
        await redisClient.expire(key, Math.ceil(windowSize / 1000));

        next();

    } catch (err) {
        console.error('Rate limiter error:', err);
        res.status(500).json({ message: "Internal server Error!" });
    }
};

const rate_limiter_light = async (req, res, next) => {
    try {
        const identifier = req.user?.email || req.ip;
        const currentTime = Date.now();
        const windowSize = 1800 * 1000; // 30 minutes in milliseconds
        const maxRequests = 30;
        const key = `rate_limit:${identifier}`;

        // Remove entries outside the sliding window
        await redisClient.zRemRangeByScore(key, 0, currentTime - windowSize);

        // Count requests in current window
        const requestCount = await redisClient.zCard(key);

        //console.log(`Light: Identifier: ${identifier}, Count: ${requestCount}`);

        if (requestCount >= maxRequests) {
            return res.status(429).json({ 
                message: "Too many requests! Please try after some time, Thank you." 
            });
        }

        // Add current request with timestamp as score
        await redisClient.zAdd(key, {
            score: currentTime,
            value: `${currentTime}-${Math.random()}` // Unique value
        });

        // Set expiry for the key (cleanup)
        await redisClient.expire(key, Math.ceil(windowSize / 1000));

        next();

    } catch (err) {
        console.error('Rate limiter error:', err);
        res.status(500).json({ message: "Internal server Error!" });
    }
};

module.exports = {rate_limiter_strict,rate_limiter_light};
