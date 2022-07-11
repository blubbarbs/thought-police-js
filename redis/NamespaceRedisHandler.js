class NamespaceRedisHandler {
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
        const promises = [];

        for (const key of keys) {
            const hash = `${this.namespace}:${key}`;
            const promise = id == null ? this.redis.del(hash) : this.redis.hDel(hash, id); 

            promises.push(promise);
        }

        await Promise.all(promises);
    }
}

module.exports = {
    NamespaceRedisHandler: NamespaceRedisHandler
}