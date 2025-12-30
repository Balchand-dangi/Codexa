const redisClient = require('../config/redis')

const rate_limiter = async (req, res, next) => {
    try {
        const ip = req.ip
        const count = await redisClient.incr(ip)
        // console.log(`IP: ${ip} and count: ${count}`)
        if (count == 1) {
            await redisClient.expire(ip, 3600)
        }
        if (count > 20) {

            return res.status(429).json({ message: "Too many requests ! plz try after some time ,Thankyou." })
            // redisClient.del(ip)
        }


        next()

    }
    catch (err) {
        res.status(500).json({ message: "Internal server Error!" })
    }
}

module.exports = rate_limiter