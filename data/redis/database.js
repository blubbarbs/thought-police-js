const { HashWrapper } = require("./hash_wrapper");
const { NamespaceWrapper } = require("./namespace_wrapper");

class Database {
    constructor(redis) {
        this.redis = redis;
        this.intervalID = null;
        this.namespaces = {};
        this.hashes = {};
    }
    
    getNamespace(namespace) {
        if (!(namespace in this.namespaces)) {
            this.namespaces[namespace] = new NamespaceWrapper(this, namespace);
        }

        return this.namespaces[namespace];
    }

    getHashspace(hash) {
        if (!(hash in this.hashes)) {
            this.hashes[hash] = new HashWrapper(this, hash);
        }

        return this.hashes[hash];    
    }

    async connect() {
        await this.redis.connect();

        this.intervalID = setInterval(async () => await this.redis.ping(), 60000);
    }
    
    async disconnect() {
        await this.redis.disconnect();
        
        clearInterval(this.intervalID);
    }
    
    async keys() {
        const keys = [];
    
        for await (const key of this.redis.scanIterator({ TYPE: 'string', MATCH: `*` })) {
            keys.push(key);
        }
    
        return keys;
    }
    
    async hashKeys(hash) {
        const keys = await this.redis.hKeys(hash);
    
        return keys;
    }
        
    async get(key) {
        const data = await this.redis.get(key);
    
        return JSON.parse(data);
    }
    
    async gets(...keys) {
        const data = await this.redis.mGet(keys);
        const dataMap = {};
        
        keys.forEach((k, i) => dataMap[k] = JSON.parse(data[i]));
    
        return dataMap;
    }

    async hashGet(hash, key) {
        if (key == null) {
            return this.hashGets(hash);
        }
        else {
            const data = await this.redis.hGet(hash, key);

            return JSON.parse(data);
        }        
    }

    async hashGets(hash, ...keys) {
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
    
    async hashSet(hash, key, value) {
        await this.redis.hSet(hash, key, JSON.stringify(value));
    }
    
    async hashSets(hash, data) {
        const arrayedData = [];
            
        for (const [k, v] of Object.entries(data)) {
            arrayedData.push(k);
            arrayedData.push(JSON.stringify(v));
        }
    
        await this.redis.hSet(hash, arrayedData);
    }
}

module.exports = {
    Database: Database
}