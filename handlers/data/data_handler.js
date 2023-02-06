const { createClient } = require('redis');
const { Collection } = require('discord.js');
const { RedisCache } = require('./redis_cache');

class DataHandler {
    static {
        this.caches = new Collection();
        this.redis = createClient({ url: process.env.REDIS_URL });
    }

    static hasKey(key) {
        return this.caches.has(key);
    }

    static cache(...namespace) {
        const firstKey = namespace.shift();

        return this.caches.ensure(firstKey, () => new RedisCache(this.redis, firstKey))._subcacheNew(...namespace);
    }

    static async fetchAll() {
        const promises = [];

        for await (const redisKey of this.redis.scanIterator({ TYPE: 'hash', MATCH: 'c:*'})) {
            const namespace = redisKey.split(':');
            const cache = this.cache(...namespace.splice(1));

            promises.push(cache.fetch());
        }

        return Promise.all(promises);
    }
}

module.exports = {
    DataHandler: DataHandler
}