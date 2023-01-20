const { Collection } = require("discord.js");

class RedisStore {}

class Redis1DStore extends RedisStore {
    constructor(redis, docName) {
        super();

        this.docName = docName;
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
        for (key of this.cache.keys()) {
            this.dirtyKeys.add(key);
        }

        this.cache.clear();
    }

    async fetch() {
        const data = await this.redis.hGetAll(this.docName);

        this.cache.clear();
        this.dirtyKeys.clear();

        for (const [key, value] of Object.entries(data)) {
            this.cache.set(key, value);
        }
    }

    async sync() {
        if (this.dirtyKeys.size == 0) return;

        const promises = [];

        for (const key of this.dirtyKeys.keys()) {
            let promise;

            if (this.cache.has(key)) {
                promise = this.redis.hSet(this.docName, key, this.cache.get(key));
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

class Redis2DStore extends RedisStore {
    constructor(redis, name) {
        super();

        this.name = name;
        this.redis = redis;
        this.stores = new Collection();
    }

    _getNewSubstore(key) {
        return new Redis1DStore(this.redis, `${this.name}:${key}`)
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

        return Object.length(data) > 0 ? data : null;
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

        for await (const redisKey of this.redis.scanIterator({ TYPE: 'string', MATCH: `${this.name}:*`})) {
            const store = new Redis1DStore(this.redis, redisKey);
            const key = redisKey.split(':')[1];

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
    RedisStore: RedisStore,
    Redis1DStore: Redis1DStore,
    Redis2DStore: Redis2DStore
}