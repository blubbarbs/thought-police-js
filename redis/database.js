const { HashWrapper } = require("./hash_wrapper");
const { NamespaceWrapper } = require("./namespace_wrapper");

class Database {
    constructor(redis) {
        this.redis = redis;
        this.intervalID = null;
    }
    
    createNamespace(namespace) {
        return new NamespaceWrapper(this, namespace);
    }

    createHash(hash) {
        return new HashWrapper(this, hash);
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
        
    async get(...keys) {
        const data = await this.redis.mGet(keys);
        const dataMap = {};
        
        keys.forEach((k, i) => dataMap[k] = JSON.parse(data[i]));
    
        return keys.length == 1 ? dataMap[keys[0]] : dataMap;
    }
    
    async hashGet(hash, ...keys) {
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
        
        return keys.length == 1 ? dataMap[keys[0]] : dataMap;
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