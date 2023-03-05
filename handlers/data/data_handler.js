const { createClient } = require('redis');
const { Collection } = require('discord.js');
const { RedisCache } = require('./redis_cache');

class DataHandler {
    static {
        this.caches = new Collection();
        this.redis = createClient({ url: process.env.REDIS_URL });
    }

    static cache(...namespace) {
        if (namespace.length == 0) {
            return null;
        }
        else {
            const key = namespace.shift();
            return this.caches.ensure(key, () => new RedisCache(this.redis, key)).subcache(...namespace);
        }

    }

    static async fetchAll() {
        const promises = [];

        for await (const redisKey of this.redis.scanIterator({ TYPE: 'hash', MATCH: 'c:*'})) {
            const namespace = redisKey.split(':').splice(1);
            const cache = this.cache(...namespace);

            promises.push(cache.fetch());
        }

        return Promise.all(promises);
    }
}

module.exports = {
    DataHandler: DataHandler
}