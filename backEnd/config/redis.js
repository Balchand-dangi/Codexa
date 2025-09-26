const redis = require("redis")
require("dotenv").config()

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-11305.crce206.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: process.env.REDIS_PORT
    }
});


module.exports = redisClient