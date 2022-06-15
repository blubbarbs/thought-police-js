class RedisDataHandler {
    constructor(redis, hashPrefix) {
        this.redis = redis;
        this.hashPrefix = hashPrefix;
    }

    async get(id, ...keys) {
        const hash = this.hashPrefix + id;

        if (keys.length == 0) {
            const data = await this.redis.hGetAll(hash);
            
            return Object.entries(data).length > 0 ? data : null;
        }
        else if (keys.length == 1) {
            const data = await this.redis.hGet(hash, keys[0]);

            return data;
        }
        else {
            const data = {};

            for (const key of keys) {
                data[key] = await this.redis.hGet(hash, key);
            }
            
            return data;            
        }
    }

    async set(id, data) {
        const hash = this.hashPrefix + id;

        for (const [key, value] of Object.entries(data)) {            
            await this.redis.hSet(hash, key, value);
        }
    }

    async delete(id, ...keys) {
        for (const key of keys) {
            await this.redis.hDel(key);
        }
    }
}

module.exports = {
    RedisDataHandler: RedisDataHandler
}