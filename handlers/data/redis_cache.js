const { Collection } = require('discord.js');

class RedisCache {
    constructor(redis, ...namespace) {
        this.redis = redis;
        this.namespace = namespace;
        this.redisPath = 'c:' + this.namespace.join(':');
        this.name = namespace[namespace.length - 1];
        this.cache = new Collection();
        this.subcacheMap = new Collection();
    }

    _subcacheNew(...namespace) {
        if (namespace.length == 0) return this;

        const key = namespace.shift();

        return this.subcacheMap.ensure(key, () => new RedisCache(this.redis, ...this.namespace, key))._subcacheNew(...namespace);
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
        this.redis.hSet(this.redisPath, key, JSON.stringify(value))
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
        this.redis.hDel(this.redisPath, key)
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
            const data = await this.redis.hGetAll(this.redisPath);

            if (!data) return;

            this.cache.clear();

            console.info('Fetching ' + this.redisPath);

            for (const [key, value] of Object.entries(data)) {
                console.info(`${key}: ${value}`);
                this.cache.set(key, JSON.parse(value));
            }
        }
    }
}

module.exports = {
    RedisCache: RedisCache
}