const { Collection } = require("discord.js");

class RemoteData {
    constructor(database, namespace = '') {
        this.database = database;
        this.namespace = namespace;
        this.namespaces = new Collection();
    }

    getNamespace(...namespaces) {
        if (namespaces.length == 0) {
            return this;
        }
        else if (namespaces.length == 1) {
            const namespace = namespaces.pop();

            if (this.namespace == '') {
                return this.namespaces.ensure(namespace, () => new RemoteData(this.database, `${namespace}`));
            }
            else {
                return this.namespaces.ensure(namespace, () => new RemoteData(this.database, `${this.namespace}:${namespace}`));
            }
        }
        else {
            let store = this;

            for (const namespace of namespaces) {
                store = store.getNamespace(namespace);
            }

            return store;
        }
    }

    async *childNamespaces() {
        const keys = [];

        for await (const key of this.database.redis.scanIterator({ TYPE: 'hash', MATCH: `${this.namespace}:*` })) {
            if (key != this.namespace) {
                const offset = this.namespace == '' ? 0 : this.namespace.length + 1;

                keys.push(key.substring(offset));
            }
        }

        for (const key of keys) {
            const splitKeys = key.split(':');
            const namespace = this.getNamespace(...splitKeys);
        
            yield namespace;
        }
    }

    async keys() {
        return this.database.hashRetrieveKeys(this.namespace);
    }

    async values() {
        return this.database.hashRetrieveValues(this.namespace);
    }

    async entries() {
        return this.getAll();
    }

    async get(...args) {
        const key = args.pop();

        return this.database.hashFetch(this.getNamespace(...args).namespace, key);
    }

    async gets(...keys) {        
        return this.database.hashFetchs(this.namespace, ...keys);
    }

    async getAll() {
        return this.database.hashFetchAll(this.namespace);
    }

    async set(...args) {          
        const value = args.pop();
        const key = args.pop();
        
        return this.database.hashPut(this.getNamespace(...args).namespace, key, value);    
    }

    async sets(data) {        
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

    async clear() {
        return this.database.delete(this.namespace);
    }

    async clearDeep() {
        const keys = [this.namespace];

        for await (const namespace of this.namespaces()) {
            keys.push(namespace.namespace);
        }

        return this.database.deletes(...keys);
    }
}

module.exports = {
    RemoteData: RemoteData
}