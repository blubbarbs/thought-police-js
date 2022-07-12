class NamespaceWrapper {
    constructor(database, namespace) {
        this.database = database;
        this.namespace = namespace;
    }

    async keys() {
        const keys = [];
        const offset = namespace.length + 1;
    
        for await (const key of this.database.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.namespace}:*` })) {
            keys.push(key.substring(offset));
        }
    
        return keys;
    }

    async get(id, ...keys) {
        const hashes = keys.map((key) => `${this.namespace}:${key}`);
        const promises = id != null ? hashes.map((hash) => this.database.hashGet(hash, id)) : hashes.map((hash) => this.database.hashGet(hash));
        const data = await Promise.all(promises);
        const dataMap = {};

        keys.forEach((key, i) => dataMap[key] = data[i]);

        return keys.length == 1 ? dataMap[keys[0]] : dataMap;
    }

    async set(id, key, value) {
        const hash = `${this.namespace}:${key}`;
    
        await this.database.hashSet(hash, id, value);
    }

    async sets(namespace, id, data) {
        const promises = [];
    
        for (const [key, value] of Object.entries(data)) {
            const hash = `${namespace}:${key}`;
    
            promises.push(this.database.hashSet(hash, key, value));
        }
    
        await Promise.all(promises);
    }

}

module.exports = {
    NamespaceWrapper: NamespaceWrapper
}