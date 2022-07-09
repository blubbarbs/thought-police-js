class RedisHandler {
    constructor (redis) {
        this.redis = redis;
    }

    async getKeys() {
        const keys = [];

        for await (const key of this.redis.scanIterator({ TYPE: 'string', MATCH: `*` })) {
            keys.push(key);
        }

        return keys;
    }

    async get(...keys) {
        if (keys.length == 0) {            
            const allKeys = await this.getKeys();
            const data = await this.get(allKeys);

            return data;
        }
        else if (keys.length == 1) {
            const data = await this.redis.get(keys[0]);
            
            return JSON.parse(data);
        }
        else {
            let allData = {};
            const data = await this.redis.mGet(keys);

            keys.forEach((k, i) => allData[k] = JSON.parse(data[i]));

            return allData;
        }
    }

    async set(key, value) {
        await this.redis.set(key, JSON.stringify(value));
    }

    async sets(data) {
        const arrayedData = [];

        for (const [k, v] of Object.entries(data)) {
            arrayedData.push(k);
            arrayedData.push(JSON.stringify(v));
        }        

        await this.redis.mSet(arrayedData);
    }

    async delete(...keys) {
        const promises = [];

        for (const key of keys) {
            promises.push(this.redis.del(key));
        }

        await Promise.all(promises);
    }
}

module.exports = {
    RedisHandler: RedisHandler
}