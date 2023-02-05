const { createClient } = require('redis');
const { Collection } = require('discord.js');

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

        return this.caches.ensure(firstKey, () => new RedisCache(firstKey))._subcacheNew(...namespace);
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

class RedisCache {
    constructor(...namespace) {
        this.namespace = namespace;
        this.redisPath = 'c:' + this.namespace.join(':');
        this.name = namespace[namespace.length - 1];
        this.cache = new Collection();
        this.subcacheMap = new Collection();
    }

    _subcacheNew(...namespace) {
        if (namespace.length == 0) return this;

        const key = namespace.shift();

        return this.subcacheMap.ensure(key, () => new RedisCache(...this.namespace, key))._subcacheNew(...namespace);
    }

    subcache(...namespace) {
        if (namespace.length == 0) return this;

        const key = namespace.shift();

        return this.subcacheMap.get(key)?.subcache(...namespace);
    }

    *subcaches(deep = false) {
        if (deep) {
            yield this;

            for (const cache of this.subcacheMap.values()) {
                yield *cache.subcaches(true);
            }
        }
        else {
            for (const cache of this.subcacheMap.values()) {
                yield cache;
            }
        }
    }

    keys() {
        return this.cache.keys();
    }

    hasKey(...args) {
        return this.get(...args) != null;
    }

    get(...args) {
        const key = args.pop();

        return this.subcache(...args)?.cache.get(key);
    }

    set(...args) {
        const value = args.pop();
        const key = args.pop();
        const cache = this._subcacheNew(...args);

        cache.cache.set(key, value);
        DataHandler.redis.hSet(this.redisPath, key, JSON.stringify(value))
        .catch(() => console.error('Failed to write for ' + this.name + ' key: ' + key + ' value: ' + value));
    }

    add(...args) {
        const value = args.pop();
        const key = args.pop();
        const cache = this._subcacheNew(...args);
        const oldValue = cache.cache.get(key) || 0;

        cache.set(key, oldValue + value);
    }

    delete(...args) {
        const key = args.pop();
        const cache = this.subcache(...args);

        cache.cache.delete(key);
        DataHandler.redis.hDel(this.redisPath, key)
        .catch(() => console.error('Failed to delete for ' + this.name + ' key: ' + key));
    }

    clear(deep = false) {
        if (deep) {
            for (const cache of this.subcaches(true)) {
                cache.clear();
            }
        }
        else {
            this.cache.clear();
            DataHandler.redis.del(this.redisPath)
            .catch(() => console.error('Failed to clear for ' + this.name));
        }
    }

    async fetch(deep = false) {
        if (deep) {
            const promises = [];

            for (const cache of this.subcaches(true)) {
                promises.push(cache.fetch());
            }

            return Promise.all(promises);
        }
        else {
            const data = await DataHandler.redis.hGetAll(this.redisPath);

            if (!data) return;

            this.cache.clear();

            console.log('FETCHING FOR ' + this.redisPath);

            for (const [key, value] of Object.entries(data)) {
                console.log(`KEY: ${key}, VALUE: ${value}`);
                this.cache.set(key, JSON.parse(value));
            }
        }
    }
}
module.exports = {
    DataHandler: DataHandler
}