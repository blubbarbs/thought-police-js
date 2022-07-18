const { Collection } = require("discord.js");

class Cache extends Collection {
    constructor(entries) {
        super(entries);

        this.changes = new Collection();
        this.deletes = new Set();
    }

    hasChanged() {
        return this.changes.size > 0 || this.deletes.size > 0;
    }

    set(key, value) {
        this.deletes.delete(key);
        this.changes.set(key, value);
        super.set(key, value);
    }

    delete(key) {
        this.deletes.add(key);
        this.changes.delete(key);
        super.delete(key);
    }

    clear() {
        for (const key of this.keys()) {
            this.delete(key);
        }
    }

    empty() {        
        this.deletes.clear();
        this.changes.clear();
    }

    load(data) {
        const entries = Array.isArray(data) ? data : Object.entries(data);

        for (const [key, value] of entries) {
            super.set(key, value);
        }        
    }
}

module.exports = {
    Cache: Cache
}