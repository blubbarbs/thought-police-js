const { Collection } = require("discord.js");

class RedisCache {}

class Redis1DCache extends RedisCache {
    constructor(redis, ...namespace) {
        super();

        this.docName = namespace.join(':');
        this.redis = redis;
        this.cache = new Collection();
        this.dirtyKeys = new Set();
    }

    isDirty() {
        return this.dirtyKeys.length > 0;
    }

    keys() {
        return this.cache.keys();
    }

    hasKey(key) {
        return this.cache.has(key);
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value) {
        const oldValue = this.get(key);

        if (oldValue != value) {
            this.cache.set(key, value);
            this.dirtyKeys.add(key);
        }
    }

    add(key, value) {
        const oldValue = this.get(key) || 0;

        this.set(key, oldValue + value);
    }

    delete(key) {
        this.cache.delete(key);
        this.dirtyKeys.add(key);
    }

    clear() {
        for (const key of this.cache.keys()) {
            this.dirtyKeys.add(key);
        }

        this.cache.clear();
    }

    async fetch() {
        const data = await this.redis.hGetAll(this.docName);

        this.cache.clear();
        this.dirtyKeys.clear();

        for (const [key, value] of Object.entries(data)) {
            this.cache.set(key, JSON.parse(value));
        }
    }

    async sync() {
        if (this.dirtyKeys.size == 0) return;

        const promises = [];

        for (const key of this.dirtyKeys.keys()) {
            let promise;

            console.log(`Found Dirty: ${this.docName} ${key}`);

            if (this.cache.has(key)) {
                promise = this.redis.hSet(this.docName, key, JSON.stringify(this.cache.get(key)));
            }
            else {
                promise = this.redis.hDel(this.docName, key);
            }

            promises.push(promise);
        }

        this.dirtyKeys.clear();

        return Promise.resolve(promises);
    }
}

class Redis2DCache extends RedisCache {
    constructor(redis, ...namespace) {
        super();

        this.name = namespace.join(':');
        this.redis = redis;
        this.stores = new Collection();
    }

    _getNewSubstore(key) {
        return new Redis1DCache(this.redis, `${this.name}:${key}`)
    }

    keys() {
        return this.stores.keys();
    }

    hasKey(key) {
        return this.stores.has(key);
    }

    hasID(id) {
        for (const store of this.stores.values()) {
            if (store.hasKey(id)) {
                return true;
            }
        }

        return false;
    }

    get(id, key) {
        if (id == null || key == null || !this.stores.has(key)) {
            return null;
        }
        else {
            return this.stores.get(key).get(id);
        }
    }

    gets(id, ...keys) {
        const data = {};
        const keyIterator = keys.length > 0 ? keys : this.stores.keys();

        for (const key of keyIterator) {
            data[key] = this.get(id, key);
        }

        return Object.keys(data).length > 0 ? data : null;
    }

    set(id, key, value) {
        if (!this.stores.has(key)) {
            this.stores.set(key, this._getNewSubstore(key));
        }

        this.stores.get(key).set(id, value);
    }

    sets(data) {
        for (const id in Object.keys(data)) {
            const subData = data[id];

            for (const [key, value] in Object.entries(subData)) {
                this.set(id, key, value);
            }
        }
    }

    add(id, key, value) {
        if (!this.stores.has(key)) {
            this.stores.set(key, this._getNewSubstore(key));
        }

        this.stores.get(key).add(id, value);
    }

    adds(data) {
        for (const id in Object.keys(data)) {
            const subData = data[id];

            for (const [key, value] in Object.entries(subData)) {
                this.add(id, key, value);
            }
        }
    }

    delete(id, key) {
        if (id == null) return;

        if (key == null) {
            for (const store of this.stores.values()) {
                store.delete(id);
            }
        }
        else {
            this.stores.get(key).delete(id);
        }
    }

    clear() {
        for (const store of this.stores.values()) {
            store.clear();
        }
    }

    async fetch() {
        this.stores.clear();

        const promises = [];

        console.log(`Beginning fetch for ${this.name}...`)

        for await (const redisKey of this.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.name}:*`})) {
            const store = new Redis1DCache(this.redis, redisKey);
            const namespace = redisKey.split(':');
            const key = namespace[namespace.length - 1];

            console.log(`FOUND ${redisKey} NAMESPACE. KEY: ${key}`);

            this.stores.set(key, store);
            promises.push(store.fetch());
        }

        await Promise.all(promises);
    }

    async sync() {
        const promises = [];

        for (const store of this.stores.values()) {
            promises.push(store.sync());
        }

        await Promise.all(promises);
    }
}

module.exports = {
    RedisCache: RedisCache,
    Redis1DCache: Redis1DCache,
    Redis2DCache: Redis2DCache
}