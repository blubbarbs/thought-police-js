const { Collection } = require("discord.js");

class Data extends Collection {
    constructor(database, namespace = '') {
        super();

        this.database = database;
        this.namespace = namespace;
        this.namespaces = new Collection();
        this.changes = new Collection();
        this.deletes = new Set();
    }

    getNamespace(...namespaces) {
        if (namespaces.length == 0) {
            return this;
        }
        else if (namespaces.length == 1) {
            const namespace = namespaces.pop();

            if (this.namespace == '') {
                return this.namespaces.ensure(namespace, () => new Data(this.database, `${namespace}`));
            }
            else {
                return this.namespaces.ensure(namespace, () => new Data(this.database, `${this.namespace}:${namespace}`));
            }
        }
        else {
            let data = this;

            for (const namespace of namespaces) {
                data = data.getNamespace(namespace);
            }

            return data;
        }
    }

    *childNamespaces() {
        const wrapperStack = [this];

        while (wrapperStack.length > 0) {
            const wrapper = wrapperStack.pop();

            for (const subwrapper of wrapper.namespaces.values()) {
                wrapperStack.push(subwrapper);
                yield subwrapper;
            }
        }
    }

    hasChanged() {
        return this.changes.size > 0 || this.deletes.size > 0;
    }

    _get(key) {
        return super.get(key);
    }

    _set(key, value) {
        this.deletes.delete(key);
        this.changes.set(key, value);
        super.set(key, value);

        return value;
    }

    _add(key, value) {
        const oldValue = this.get(key) || 0;
        const newValue = oldValue + value;

        this._set(key, newValue);

        return newValue;
    }

    _delete(key) {
        this.deletes.add(key);
        this.changes.delete(key);
        super.delete(key);

        return key;
    }

    get(...args) {
        const key = args.pop();

        return this.getNamespace(...args)._get(key);
    }

    gets(...keys) {
        const data = {};

        for (const key of keys) {
            data[key] = super.get(key);
        }

        return data;
    }

    getAll() {
        return this.gets(Array.from(this.keys()));
    }

    set(...args) {
        const value = args.pop();
        const key = args.pop();    

       this.getNamespace(...args)._set(key, value);
    }

    sets(data) {
        for (const [key, value] of Object.entries(data)) {
            this._set(key, value);
        }
    }

    add(...args) {
        const value = args.pop();
        const key = args.pop();
    
        return this.getNamespace(...args)._add(key, value);
    }

    adds(data) {
        for (const [key, value] of Object.entries(data)) {
            this._add(key, value);
        }
    }

    delete(...args) {
        const key = args.pop();

        return this.getNamespace(...args)._delete(key);
    }

    deletes(...keys) {
        for (const key of keys) {
            this._delete(key);
        }
    }

    clear() {
        for (const key of this.keys()) {
            this._delete(key);
        }
    }

    clearDeep() {
        this.clear();

        for (const namespace of this.childNamespaces()) {
            namespace.clear();
        }
    }

    reset() {
        this.deletes.clear();
        this.changes.clear();
    }

    resetDeep() {
        this.reset();

        for (const namespace of this.childNamespaces()) {
            namespace.reset();
        }
    }

    async save() {
        const promises = [];

        if (this.changes.size > 0) {
            const changes = Object.fromEntries(this.changes.entries());
            const promise = this.namespace == '' ? this.database.puts(changes) : this.database.hashPuts(this.namespace, changes);

            console.log('SAVING ' + this.namespace)
            console.log(changes);    

            promises.push(promise);
        }

        if (this.deletes.size > 0) {
            const deletes = Array.from(this.deletes);
            const promise = this.namespace == '' ? this.database.deletes(deletes) : this.database.hashDeletes(this.namespace, ...deletes);

            console.log('DELETING ' + this.namespace)
            console.log(deletes);    

            promises.push(promise);
        }
        
        this.reset();
        
        await Promise.all(promises);
    }

    async saveDeep() {
        const promises = [this.save()];

        for (const namespace of this.childNamespaces()) {
            promises.push(namespace.save());
        }

        await Promise.all(promises);
    }

    async load()  {
        const data = this.namespace == '' ? await this.database.fetchAll() : await this.database.hashFetchAll(this.namespace);

        for (const [key, value] of Object.entries(data)) {
            this._set(key, value);
        }

        console.log('LOADED ' + this.namespace);
        console.log(data);

        this.reset();
    }

    async loadDeep() {
        const searchKey = this.namespace == '' ? '*' : `${this.namespace}:*`;
        const allChildKeys = (await this.database.retrieveKeys('hash', searchKey)).map(v => v.substring(searchKey.length - 1));
        const promises = [this.load()];

        for (const key of allChildKeys) {
            const namespaces = key.split(':');

            promises.push(this.getNamespace(...namespaces).load());
        }

        await Promise.all(promises);
    }
}

module.exports = {
    Data: Data
}