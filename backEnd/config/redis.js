const redis = require("redis")
require("dotenv").config()

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-15046.c212.ap-south-1-1.ec2.cloud.redislabs.com',
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