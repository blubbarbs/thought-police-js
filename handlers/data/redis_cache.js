const { Collection } = require('discord.js');

class RedisCache extends Collection {
    constructor(redis, ...namespace) {
        super();

        this.redis = redis;
        this.name = namespace[namespace.length - 1];
        this.namespace = namespace;
        this.redisPath = ['c', ...this.namespace].join(':');
        this.childMap = new Collection();
    }

    child(...namespace) {
        let cache = this;

        for (const key of namespace) {
            cache = cache.childMap.ensure(key, () => new RedisCache(this.redis, ...cache.namespace, key));
        }

        return cache;
    }

    *children(deep = false) {
        if (deep) {
            yield this;

            for (const cache of this.childMap.values()) {
                yield *cache.children(true);
            }
        }
        else {
            for (const cache of this.childMap.values()) {
                yield cache;
            }
        }
    }

    set(key, value) {
        super.set(key, value);
        this.redis.hSet(this.redisPath, key, JSON.stringify(value))
        .catch(() => console.error('Failed to write for ' + this.name + ' key: ' + key + ' value: ' + value));
    }

    add(key, value) {
        const oldValue = super.get(key) || 0;

        this.set(key, oldValue + value);
    }

    delete(key) {
        super.delete(key);
        this.redis.hDel(this.redisPath, key)
        .catch(() => console.error('Failed to delete for ' + this.name + ' key: ' + key));
    }

    clear(deep = false) {
        if (deep) {
            for (const cache of this.children(true)) {
                cache.clear();
            }
        }
        else {
            super.clear();
            this.redis.del(this.redisPath)
            .catch(() => console.error('Failed to clear for ' + this.name));
        }
    }

    async fetch(deep = false) {
        if (deep) {
            const promises = [];

            for (const cache of this.children(true)) {
                promises.push(cache.fetch());
            }

            return Promise.all(promises);
        }
        else {
            const data = await this.redis.hGetAll(this.redisPath);

            if (!data) return;

            super.clear();

            console.info('Fetching ' + this.redisPath);

            for (const [key, value] of Object.entries(data)) {
                console.info(`${key}: ${value}`);
                super.set(key, JSON.parse(value));
            }
        }
    }
}

module.exports = {
    RedisCache: RedisCache
}