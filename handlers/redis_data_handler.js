class NamespaceDataHandler {
    constructor(redis, namespace) {
        this.redis = redis;
        this.namespace = namespace;
    }

    async getKeys() {
        const keys = [];
        const offset = this.namespace.length + 1;

        for await (const key of this.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.namespace}:*` })) {
            keys.push(key.substring(offset));
        }

        return keys;
    }

    async get(id, ...keys) {
        if (id == null) {
            if (keys.length == 0) {
                const allKeys = await this.getKeys();
                const data = await this.get(id, allKeys);

                return data;
            }
            else if (keys.length == 1) {
                const hash = `${this.namespace}:${keys[0]}`;
                const data = await this.redis.hGetAll(hash)

                for (const [k, v] of Object.entries(data)) {
                    data[k] = JSON.parse(v);
                }

                return data;
            }
            else {
                const allData = {};
                const promises = keys.map((key) => this.redis.hGetAll(`${this.namespace}:${key}`));
                const data = await Promise.all(promises);
                
                for (const d of data) {
                    if (Object.keys(d).length == 0) {
                        d[k] = null;
                    }
                    else {
                        for (const [k, v] of Object.entries(d)) {
                            d[k] = JSON.parse(v);
                        }    
                    }
                }

                data.forEach((d, i) => data[i] = Object.entries(d) != null ? JSON.parse(d) : null);
                keys.forEach((k, i) => allData[k] = data[i]);
    
                return allData;
            }
        }
        else {
            if (keys.length == 0) {
                const allKeys = await this.getKeys();
                const data = await this.get(id, allKeys);

                return data;
            }
            else if (keys.length == 1) {
                const hash = `${this.namespace}:${keys[0]}`;
                const data = await this.redis.hGet(hash, id);

                return JSON.parse(data);
            }        
            else {
                const allData = {};
                const promises = keys.map((key) => this.redis.hGet(`${this.namespace}:${key}`, id));
                const data = await Promise.all(promises);

                data.forEach((d, i) => data[i] = JSON.parse(d));
                keys.forEach((k, i) => allData[k] = data[i]);

                return allData;
            }
        }
    }

    async set(id, key, value) {
        const hash = `${this.namespace}:${key}`
        
        await this.redis.hSet(hash, id, JSON.stringify(value));
    }

    async sets(id, data) {
        const promises = [];

        for (const [key, value] of Object.entries(data)) {
            const hash = `${this.namespace}:${key}`;

            promises.push(this.redis.hSet(hash, id, JSON.stringify(value)));
        }

        await Promise.all(promises);
    }

    async delete(id, ...keys) {
        const hash = `${this.namespace}:${id}`;

        if (id == null) {
            const promises = [];

            for (const key of keys) {
                promises.push(this.redis.del(hash));
            }

            await Promise.all(promises);
        }
        else {
            const promises = [];

            for (const key of keys) {
                const hash = `${this.namespace}:${key}`;

                promises.push(this.redis.hDel(hash));
            }
                
            await Promise.all(promises);          
        }
    }
}

class HashDataHandler {
    constructor(redis, hash) {
        this.redis = redis;
        this.hash = hash;
    }

    async getKeys() {
        const keys = await this.redis.hKeys(this.hash);

        return keys;
    }

    async get(...keys) {
        if (keys.length == 0) {
            const allKeys = await this.getKeys();
            const data = await this.get(id, allKeys);

            return data;
        }
        else if (keys.length == 1) {
            const data = await this.redis.hGet(this.hash, keys[0]);

            return JSON.parse(data);
        }
        else {
            const allData = {};
            const data = await this.redis.hGet(this.hash, keys);

            keys.forEach((k, i) => allData[k] = JSON.parse(data[i]));

            return allData;
        }
    }

    async set(key, value) {
        await this.redis.hSet(this.hash, key, JSON.stringify(value));
    }

    async sets(data) {
        const arrayedData = [];
        
        for (const [k, v] of Object.entries(data)) {
            arrayedData.push(k);
            arrayedData.push(JSON.stringify(v));
        }

        await this.redis.hSet(this.hash, ...arrayedData);
    }

    async delete(...keys) {
        const promises = [];

        for (const key of keys) {
            promises.push(this.redis.hDel(key));
        }

        await Promise.all(promises);
    }
}

class DataHandler {
    constructor (redis) {
        this.redis = redis;
    }

    async getKeys() {
        const keys = [];

        for await (const key of this.redis.scanIterator({ TYPE: 'string', MATCH: `*` })) {
            keys.push(key);
        }

        return keys;
    }

    async get(...keys) {
        if (keys.length == 0) {            
            const allKeys = await this.getKeys();
            const data = await this.get(allKeys);

            return data;
        }
        else if (keys.length == 1) {
            const data = await this.redis.get(keys[0]);
            
            return JSON.parse(data);
        }
        else {
            let allData = {};
            const data = await this.redis.mGet(keys);

            keys.forEach((k, i) => allData[k] = JSON.parse(data[i]));

            return allData;
        }
    }

    async sets(data) {
        const arrayedData = [];

        for (const [k, v] of Object.entries(data)) {
            arrayedData.push(k);
            arrayedData.push(JSON.stringify(v));
        }        

        await this.redis.mSet(...arrayedData);
    }

    async set(key, value) {
        await this.redis.set(key, JSON.stringify(value));
    }

    async delete(...keys) {
        const promises = [];

        for (const key of keys) {
            promises.push(this.redis.del(key));
        }

        await Promise.all(promises);
    }
}

module.exports = {
    NamespaceDataHandler: NamespaceDataHandler,
    HashDataHandler: HashDataHandler,
    DataHandler: DataHandler
}