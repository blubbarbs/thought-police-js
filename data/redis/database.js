const { Collection } = require("discord.js");
const { NamespaceWrapper } = require("./namespace_wrapper");

class Database {
    constructor(redis) {
        this.redis = redis;
        this.intervalID = null;
        this.namespaces = new Collection();
    }

    getNamespace(...namespaces) {
        if (namespaces.length == 0) {
            return this;
        }
        else if (namespaces.length == 1) {
            const namespace = namespaces.pop();
            
            return this.namespaces.ensure(namespace, () => new NamespaceWrapper(this, namespace));
        }
        else {
            let store = this;

            for (const namespace of namespaces) {
                store = store.getNamespace(namespace);
            }

            return store;
        }
    }

    async connect() {
        await this.redis.connect();

        this.intervalID = setInterval(async () => await this.redis.ping(), 60000);
    }
    
    async disconnect() {
        await this.redis.disconnect();
        
        clearInterval(this.intervalID);
    }
    
    async retrieveKeys() {
        const keys = [];
    
        for await (const key of this.redis.scanIterator({ TYPE: 'string', MATCH: `*` })) {
            keys.push(key);
        }
    
        return keys;
    }
    
    async hashRetrieveKeys(hash) {
        const keys = await this.redis.hKeys(hash);
    
        return keys;
    }

    async fetch(key) {
        const data = await this.redis.get(key);
            
        return JSON.parse(data);
    }
    
    async fetchs(...keys) {
        const data = await this.redis.mGet(keys);
        const dataMap = {};
        
        keys.forEach((k, i) => dataMap[k] = JSON.parse(data[i]));
    
        return dataMap;
    }

    async fetchAll() {
        const keys = await this.retrieveKeys();

        return this.fetchs(keys);
    }

    async hashFetch(hash, key) {
        if (key == null) {
            return this.hashFetch(hash);
        }
        else {
            const data = await this.redis.hGet(hash, key);

            return JSON.parse(data);
        }        
    }

    async hashFetchs(hash, ...keys) {
        const dataMap = {};

        if (keys.length > 0) {
            const data = await this.redis.hmGet(hash, keys);

            keys.forEach((key, i) => dataMap[key] = JSON.parse(data[i]));
        }
        else {
            const data = await this.redis.hGetAll(hash);

            for (const [k, v] of Object.entries(data)) {
                dataMap[k] = JSON.parse(v);
            }
        }
        
        return dataMap;
    }

    async hashFetchAll(hash) {
        return this.hashFetchs(hash);
    }

    async put(key, value) {
        return this.redis.set(key, JSON.stringify(value));
    }
    
    async puts(data) {
        const arrayedData = [];
    
        for (const [k, v] of Object.entries(data)) {
            arrayedData.push(k);
            arrayedData.push(JSON.stringify(v));
        }        
    
        return this.redis.mSet(arrayedData);
    }
    
    async add(key, value) {
        if (Number.isInteger(value)) {
            return this.redis.incrBy(key, value);
        }
        else {
            return this.redis.incrByFloat(key, value);
        }
    }

    async adds(data) {
        const promises = [];

        for (const [key, value] of Object.entries(data)) {
            promises.push(this.add(key, value));
        }

        return Promise.all(promises);
    }

    async hashPut(hash, key, value) {
        return this.redis.hSet(hash, key, JSON.stringify(value));
    }
    
    async hashPuts(hash, data) {
        const arrayedData = [];
            
        for (const [k, v] of Object.entries(data)) {
            arrayedData.push(k);
            arrayedData.push(JSON.stringify(v));
        }
    
        return this.redis.hSet(hash, arrayedData);
    }

    async hashAdd(hash, key, value) {
        if (Number.isInteger(value)) {
            return this.redis.hIncrBy(hash, key, value);
        }
        else {
            return this.redis.hIncrByFloat(hash, key, value);
        }
    }

    async hashAdds(hash, data) {
        const promises = [];

        for (const [key, value] of Object.entries(data)) {
            promises.push(this.hashAdd(hash, key, value));
        }

        return Promise.all(promises);
    }

    async delete(key) {        
        return this.redis.del(key);
    }

    async deletes(...keys) {
        return this.redis.del(keys);
    }

    async deleteAll() {
        const keys = await this.retrieveKeys();

        return this.deletes(keys);
    }

    async hashDelete(hash, key) {
        return this.redis.hDel(hash, key);
    }

    async hashDeletes(hash, ...keys) {
        return this.redis.hDel(hash, keys);
    }

    async hashDeleteAll(hash) {
        return this.redis.del(hash);
    }
}

module.exports = {
    Database: Database
}