class NamespaceWrapper {
    constructor(database, toplevel) {
        this.database = database;
        this.toplevel = toplevel;
    }

    async keys(namespace) {    
        if (namespace == null) {
            const keys = [];
            const offset = this.toplevel.length + 1;

            for await (const key of this.database.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.toplevel}:*` })) {
                keys.push(key.substring(offset));
            }

            return keys;
        }
        else {
            const hash = `${this.toplevel}:${namespace}`;

            return this.database.hashKeys(hash);
        }    
    }

    async get(namespace, ...keys) {
        const hash = `${this.toplevel}:${namespace}`;

        return key2 == null ? this.database.hashGet(hash) : this.database.hashGet(hash, keys);
    }

    async set(namespace, key, value) {
        const hash = `${this.toplevel}:${namespace}`;
    
        return this.database.hashSet(hash, key, value);
    }

    async sets(allData) {
        const promises = []; 
        
        for (const [namespace, data] of Object.entries(allData)) {
            const hash = `${this.toplevel}:${namespace}`;
        
            promises.push(this.database.hashSets(hash, data));
        }

        await Promise.all(promises);
    }
}

module.exports = {
    NamespaceWrapper: NamespaceWrapper
}