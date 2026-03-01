const redisClient = require('../config/redis');

const isRedisReady = () => Boolean(redisClient && redisClient.isOpen);

const getCache = async (key) => {
    if (!isRedisReady()) return null;
    try {
        return await redisClient.get(key);
    } catch (error) {
        console.log('Redis get error:', error.message);
        return null;
    }
};

const setCache = async (key, value, ttlSeconds = 1800) => {
    if (!isRedisReady()) return;
    try {
        await redisClient.set(key, value, { EX: ttlSeconds });
    } catch (error) {
        console.log('Redis set error:', error.message);
    }
};

const deleteByPattern = async (pattern) => {
    if (!isRedisReady() || typeof pattern !== 'string' || pattern.length === 0) return;

    try {
        const keys = [];
        for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
            if (typeof key === 'string' && key.length > 0) {
                keys.push(key);
            }
        }

        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    } catch (error) {
        console.log('Redis delete pattern error:', error.message);
    }
};

const deleteByPatterns = async (patterns = []) => {
    const validPatterns = patterns.filter(pattern => typeof pattern === 'string' && pattern.length > 0);
    await Promise.all(validPatterns.map(pattern => deleteByPattern(pattern)));
};

const deleteKeys = async (keys = []) => {
    if (!isRedisReady() || keys.length === 0) return;
    try {
        const validKeys = keys.filter(key => typeof key === 'string' && key.length > 0);
        if (validKeys.length === 0) return;
        await redisClient.del(...validKeys);
    } catch (error) {
        console.log('Redis delete key error:', error.message);
    }
};

module.exports = {
    getCache,
    setCache,
    deleteByPattern,
    deleteByPatterns,
    deleteKeys
};
