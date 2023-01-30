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

        for await (const redisKey of this.redis.scanIterator({ TYPE: 'hash'})) {
            const cache = this.cache(...redisKey.split(':'));

            promises.push(cache.fetch());
        }

        return Promise.all(promises);
    }

    static async syncAll() {
        const promises = [];

        for (const topLevelCache of this.caches.values()) {
            promises.push(topLevelCache.sync(true));
        }

        return Promise.all(promises);
    }
}

class RedisCache {
    constructor(...namespace) {
        this.namespace = namespace;
        this.redisPath = this.namespace.join(':');
        this.name = namespace[namespace.length - 1];
        this.cache = new Collection();
        this.subcacheMap = new Collection();
        this.dirtyKeys = new Set();
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

    isDirty() {
        return this.dirtyKeys.size > 0;
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

        console.log('SETTING FOR ' + cache.redisPath);
        console.log('KEY: ' + key);
        console.log('VAL ' + value);

        if (cache.cache.get(key) == value) return;

        console.log('ditry');

        cache.cache.set(key, value);
        cache.dirtyKeys.add(key);
    }

    add(...args) {
        const value = args.pop();
        const key = args.pop();
        const cache = this._subcacheNew(...args);
        const oldValue = cache.cache.get(key) || 0;

        console.log('Adding...??');

        cache.set(key, oldValue + value);
    }

    delete(...args) {
        const key = args.pop();
        const cache = this.subcache(...args);

        if (cache == null || !cache.cache.has(key)) return;

        cache.cache.delete(key);
        cache.dirtyKeys.add(key);
    }

    clear(deep = false) {
        if (deep) {
            for (const cache of this.subcaches(true)) {
                cache.clear();
            }
        }
        else {
            for (const key of this.cache.keys()) {
                this.dirtyKeys.add(key);
            }

            this.cache.clear();
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

            console.log(`FETCHING AaaLL FOR ${this.redisPath}`);

            if (!data) return;

            this.cache.clear();
            this.dirtyKeys.clear();

            for (const [key, value] of Object.entries(data)) {
                console.log(`KEY: ${key}, VALUE: ${value}`);
                this.cache.set(key, JSON.parse(value));
            }

        }
    }

    async sync(deep = false) {
        if (deep) {
            const promises = [];

            for (const cache of this.subcaches(true)) {
                console.log(cache);
                promises.push(cache.sync());
            }

            return Promise.all(promises);
        }
        else {
            console.log('Attempting sync for ' + this.redisPath);
            if (!this.isDirty()) return;
            console.log('Was dirty');

            const promises = [];

            for (const key of this.dirtyKeys.keys()) {
                let promise;

                console.log(`Found Dirty: ${this.redisPath} ${key}`);

                if (this.cache.has(key)) {
                    promise = DataHandler.redis.hSet(this.redisPath, key, JSON.stringify(this.cache.get(key)));
                }
                else {
                    promise = DataHandler.redis.hDel(this.redisPath, key);
                }

                promises.push(promise);
            }

            this.dirtyKeys.clear();

            return Promise.all(promises);
        }
    }
}
module.exports = {
    DataHandler: DataHandler
}