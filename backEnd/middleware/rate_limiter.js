const redisClient = require('../config/redis');


const createRateLimiter = ({ windowSizeMs, maxRequests, prefix }) => {
  return async (req, res, next) => {
    try {
      // Use email if authenticated, otherwise use IP
      // For production, consider using x-forwarded-for or other headers
      let identifier = req.user?.email;
      if (!identifier) {
        identifier = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || 'unknown';
      }
      const key = `${prefix}:${identifier}`;

      const currentTime = Date.now();
      const windowStart = currentTime - windowSizeMs;

      const multi = redisClient.multi();

      // 1️ Remove old requests
      multi.zRemRangeByScore(key, 0, windowStart);

      // 2️ Add current request
      multi.zAdd(key, {
        score: currentTime,
        value: `${currentTime}`
      });

      // 3️ Get current count
      multi.zCard(key);

      // 4️ Set expiry
      multi.expire(key, Math.ceil(windowSizeMs / 1000));

      const [, , requestCount] = await multi.exec();
      //console.log(`Rate limiter [${prefix}] for ${identifier}: ${requestCount} requests in the last ${windowSizeMs / 60000} minutes.`);

      if (requestCount > maxRequests) {
        return res.status(429).json({
          message: "Too many requests! Please try after some time."
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      res.status(500).json({ message: "Internal server error!" });
    }
  };
};

//  Create different limiters
const rate_limiter_strict = createRateLimiter({
  windowSizeMs: 30 * 60 * 1000,
  maxRequests: 60,
  prefix: "rate_limit:strict",
});

const rate_limiter_light = createRateLimiter({
  windowSizeMs: 15 * 60 * 1000,
  maxRequests: 60,
  prefix: "rate_limit:light",
});

module.exports = { rate_limiter_strict, rate_limiter_light };