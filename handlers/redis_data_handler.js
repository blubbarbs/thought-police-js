class NamespaceDataHandler {
    constructor(redis, namespace) {
        this.redis = redis;
        this.namespace = namespace;
    }

    async getKeys() {
        const keys = [];

        for await (const key of this.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.namespace}:*`})) {
            keys.push(key);
        }

        return keys;
    }

    async get(id, ...keys) {
        const hash = `${this.namespace}:${id}`;

        if (id != null) {
            if (keys.length == 0) {
                const data = await this.redis.hGetAll(hash);

                for (const [k, v] of Object.entries(data)) {
                    data[k] = JSON.parse(v);
                }

                return Object.keys(data).length == 0 ? null : data;
            }
            else if (keys.length == 1) {
                const data = await this.redis.hGet(hash, keys[0]);

                return JSON.parse(data);
            }
            else {            
                const keyedData = {};

                for (const key of keys) {
                    const data = await this.redis.hGet(hash, key);
                    
                    keyedData[key] = JSON.parse(data);
                }
                
                return keyedData;
            }    
        }
        else {
            const namespacedKeys = await this.getKeys();
            const promises = [];

            for (const namespacedKey of namespacedKeys) {
                promises.push(this.redis.hGetAll(namespacedKey));
            }

            const allData = {};
            const keyOffset = this.namespace.length + 1;
            const retrievedData = await Promise.all(promises);

            for (let i = 0; i < promises.length; i++) {
                const namespacedKey = namespacedKeys[i];
                const data = retrievedData[i];

                for (const [k, v] of Object.entries(data)) {
                    data[k] = JSON.parse(v);
                }

                allData[namespacedKey.substring(keyOffset)] = data;
            }

            return allData;
        }
    }

    async sets(id, data) {
        const hash = `${this.namespace}:${id}`;

        for (const [k, v] of Object.entries(data)) {
            await this.redis.hSet(hash, k, JSON.stringify(v));
        }
    }

    async set(id, key, value) {
        const data = {};
        data[key] = value;

        await this.sets(id, data);
    }

    async delete(id, ...keys) {
        const hash = `${this.namespace}:${id}`;

        if (id == null) {
            const keys = await this.getKeys();

            for (const key of keys) {
                await this.redis.del(key);
            }
        }
        else if (keys.length == 0) {
            await this.redis.del(hash);
        }
        else {         
            for (const key of keys) {
                await this.redis.hDel(hash, key);
            }
        }
    }
}

class HashDataHandler {
    constructor(redis, hash) {
        this.redis = redis;
        this.hash = hash;
    }

    async get(...keys) {
        if (keys.length == 0) {
            const data = await this.redis.hGetAll(this.hash);

            for (const [k, v] of Object.entries(data)) {
                data[k] = JSON.parse(v);
            }

            return Object.keys(data).length == 0 ? null : data;
        }
        else if (keys.length == 1) {
            const data = await this.redis.hGet(this.hash, keys[0]);

            return JSON.parse(data);
        }
        else {
            const allData = {};

            for (const key of keys) {
                const data = await this.redis.hGet(this.hash, key);

                allData[key] = JSON.parse(data);
            }

            return allData;
        }
    }

    async sets(data) {
        for (const [key, value] of Object.entries(data)) {
            await this.redis.hSet(this.hash, key, JSON.stringify(value));
        }
    }

    async set(key, value) {
        const data = {};
        data[key] = value;

        await this.sets(data);
    }

    async delete(...keys) {
        for (const key of keys) {
            await this.redis.hDel(key);
        }
    }
}

class KeyedDataHandler {
    constructor (redis) {
        this.redis = redis;
    }

    async get(...keys) {
        if (keys.length == 0) {            
            return null;
        }
        else if (keys.length == 1) {
            const data = await this.redis.get(keys[0]);
            
            return JSON.parse(data);
        }
        else {
            let allData = {};

            for (const key of keys) {
                const data = await this.redis.get(key);
                
                allData[key] = JSON.parse(data);
            }

            return allData;
        }
    }

    async sets(data) {
        for (const [key, value] of Object.entries(data)) {
            await this.redis.set(key, JSON.stringify(value));
        }        
    }

    async set(key, value) {
        const data = {};
        data[key] = value;

        await this.sets(data);
    }

    async delete(...keys) {
        for (const key of keys) {
            await this.redis.del(key);
        }
    }
}

module.exports = {
    NamespaceDataHandler: NamespaceDataHandler,
    HashDataHandler: HashDataHandler,
    KeyedDataHandler: KeyedDataHandler
}