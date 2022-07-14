class NamespaceWrapper {
    constructor(database, toplevel) {
        this.database = database;
        this.toplevel = toplevel;
    }

    hash(namespace) {
        return `${this.toplevel}:${namespace}`;
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
            return this.database.hashKeys(this.hash(namespace));
        }    
    }

    async get(namespace, key) {
        return this.database.hashGet(this.hash(namespace), key);
    }

    async gets(namespace, ...keys) {
        return this.database.hashGets(this.hash(namespace), ...keys);
    }

    async set(namespace, key, value) {    
        return this.database.hashSet(this.hash(namespace), key, value);
    }

    async sets(allData) {
        const promises = []; 
        
        for (const [namespace, data] of Object.entries(allData)) {        
            promises.push(this.database.hashSets(this.hash(namespace), data));
        }

        await Promise.all(promises);
    }
}

module.exports = {
    NamespaceWrapper: NamespaceWrapper
}