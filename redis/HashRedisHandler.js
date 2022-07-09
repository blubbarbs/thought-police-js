class HashRedisHandler {
    constructor(redis, hash) {
        this.redis = redis;
        this.hash = hash;
    }

    async getKeys() {
        const keys = await this.redis.hKeys(this.hash);

        return keys;
    }

    async get(...keys) {
        if (keys.length == 0) {
            const allKeys = await this.getKeys();
            const data = await this.get(id, allKeys);

            return data;
        }
        else if (keys.length == 1) {
            const data = await this.redis.hGet(this.hash, keys[0]);

            return JSON.parse(data);
        }
        else {
            const allData = {};
            const data = await this.redis.hGet(this.hash, keys);

            keys.forEach((k, i) => allData[k] = JSON.parse(data[i]));

            return allData;
        }
    }

    async set(key, value) {
        await this.redis.hSet(this.hash, key, JSON.stringify(value));
    }

    async sets(data) {
        const arrayedData = [];
        
        for (const [k, v] of Object.entries(data)) {
            arrayedData.push(k);
            arrayedData.push(JSON.stringify(v));
        }

        await this.redis.hSet(this.hash, arrayedData);
    }

    async delete(...keys) {
        const promises = [];

        for (const key of keys) {
            promises.push(this.redis.hDel(key));
        }

        await Promise.all(promises);
    }
}

module.exports = {
    HashRedisHandler: HashRedisHandler
}