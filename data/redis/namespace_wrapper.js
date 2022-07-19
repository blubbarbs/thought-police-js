const { Collection } = require("discord.js");
const { Cache } = require("../cache");

class NamespaceWrapper {
    constructor(database, namespace) {
        this.database = database;
        this.namespace = namespace;
        this.namespaces = new Collection();
        this.cache = new Cache();
    }

    cacheGet(...args) {
        const key = args.pop();

        return this.getNamespace(...args).cache.get(key);
    }

    cacheSet(...args) {
        const value = args.pop();
        const key = args.pop();
        
        return this.getNamespace(...args).cache.set(key, value);
    }

    cacheDelete(...args) {
        const key = args.pop();

        this.getNamespace(...args).cache.delete(key);
    }

    cacheClear(deep = false) {
        if (deep) {
            for (const namespace of this.walkNamespaces()) {
                namespace.cacheClear();
            }
        }
        else {
            this.cache.clear();
        }
    }

    getNamespace(...namespaces) {
        if (namespaces.length == 0) {
            return this;
        }
        else if (namespaces.length == 1) {
            const namespace = namespaces.pop();

            return this.namespaces.ensure(namespace, () => new NamespaceWrapper(this.database, `${this.namespace}:${namespace}`));
        }
        else {
            let store = this;

            for (const namespace of namespaces) {
                store = store.getNamespace(namespace);
            }

            return store;
        }
    }

    *walkNamespaces() {
        const wrapperStack = [this];

        while (wrapperStack.length > 0) {
            const wrapper = wrapperStack.pop();

            for (const subwrapper of wrapper.namespaces.values()) {
                wrapperStack.push(subwrapper);
                yield subwrapper;
            }
        }
    }

    async retrieveChildKeys() {
        const keys = [];

        for await (const key of this.database.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.namespace}:*` })) {
            if (key != this.namespace) {
                keys.push(key.substring(this.namespace.length + 1));
            }
        }

        return keys;
    }

    async retrieveKeys() {
        return this.database.hashRetrieveKeys(this.namespace);
    }

    async fetch(...args) {
        const key = args.pop();

        return this.database.hashFetch(this.getNamespace(...args).namespace, key);
    }

    async fetchs(...keys) {        
        return this.database.hashFetchs(this.namespace, ...keys);
    }

    async fetchAll() {
        return this.database.hashFetchAll(this.namespace);
    }

    async put(...args) {          
        const value = args.pop();
        const key = args.pop();
        
        return this.database.hashPut(this.getNamespace(...args).namespace, key, value);    
    }

    async puts(data) {        
        return this.database.hashPuts(this.namespace, data);
    }

    async add(...args) {
        const value = args.pop();
        const key = args.pop();

        return this.database.hashAdd(this.getNamespace(...args).namespace, key, value);
    }

    async adds(data) {
        return this.database.hashAdds(this.namespace, data);
    }

    async delete(...args) {
        const key = args.pop();

        return this.database.hashDelete(this.getNamespace(...args).namespace, key);
    }

    async deletes(...keys) {
        return this.database.hashDeletes(this.namespace, ...keys);
    }

    async deleteAll(deep = false) {
        if (deep) {
            const keys = await this.retrieveChildKeys();
            keys.push(this.namespace);

            return this.database.deletes(...keys);
        }
        else {
            return this.database.delete(this.namespace);
        }
    }

    async saveAllCache() {
        const promises = [this.saveCache()];

        for (const subspace of this.walkNamespaces()) {
            promises.push(subspace.saveCache());
        }

        await Promise.all(promises);
    }
    
    async saveCache() {
        const promises = [];

        if (this.cache.changes.size > 0) {
            const data = Object.fromEntries(this.cache.changes.entries());
            promises.push(this.puts(data));

            console.log(`SAVING FROM ${this.namespace}`);
            console.log(data);    
        }

        if (this.cache.deletes.size > 0) {
            const deletes = Array.from(this.cache.deletes.values());
            promises.push(this.deletes(...deletes));

            console.log(`DELETING FROM ${this.namespace}`);
            console.log(deletes);    
        }

        this.cache.empty();
        await Promise.all(promises);
    }

    async loadChildNamespaces() {
        const allChildKeys = await this.retrieveChildKeys();

        for (const key of allChildKeys) {
            const namespaces = key.split(':');
            this.getNamespace(...namespaces);
        }
    }

    async loadAllCache() {
        await this.loadChildNamespaces();
        
        const promises = [this.loadCache()];
        
        for (const subspace of this.walkNamespaces()) {
            promises.push(subspace.loadCache());
        }

        await Promise.all(promises);
    }

    async loadCache() {
        const data = await this.fetchAll();

        console.log('LOADING TO ' + this.namespace);
        console.log(data);
        
        this.cache.load(data);
    }
}

module.exports = {
    NamespaceWrapper: NamespaceWrapper
}