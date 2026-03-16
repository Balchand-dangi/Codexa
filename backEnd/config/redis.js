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

// Error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('ready', () => {
    console.log('Redis Client is ready');
});

module.exports = redisClient