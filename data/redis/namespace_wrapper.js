class NamespaceWrapper {
    constructor(database, namespace) {
        this.database = database;
        this.namespace = namespace;
    }

    async keys(key) {    
        if (key == null) {
            const keys = [];
            const offset = namespace.length + 1;

            for await (const key of this.database.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.namespace}:*` })) {
                keys.push(key.substring(offset));
            }

            return keys;
        }
        else {
            return this.database.hashKeys(key);
        }    
    }

    async get(key1, key2) {
        const hash = `${this.namespace}:${key1}`;

        return key2 == null ? this.database.hashGet(hash) : this.database.hashGet(hash, key2);
    }

    async set(key1, key2, value) {
        const hash = `${this.namespace}:${key1}`;
    
        return this.database.hashSet(hash, key2, value);
    }

    async sets(key, data) {
        const hash = `${this.namespace}:${key}`;
        
        return this.database.hashSets(hash, data);
    }
}

module.exports = {
    NamespaceWrapper: NamespaceWrapper
}