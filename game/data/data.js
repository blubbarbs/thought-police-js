const { Collection } = require("discord.js");

class Data extends Collection {
    constructor(key, database) {        
        super();

        this.key = key;
        this.database = database;
    }

    async save() {
        await this.database.set(this.key, Array.from(this.entries()));
    }

    async load() {
        const data = await this.database.get(this.key);

        if (data == null) return;

        const entries = new Collection(data);

        for (const [key, value] of entries) {
            this.set(key, value);
        }
    }
}

class IDData extends Data {
    constructor(key, database) {
        super(key, database);
    }

    get(id, key) {
        if (key == null) {
            const data = new Collection();

            for(const [key, value] of this.entries()) {
                data.set(key, value.get(id));
            }

            return data;
        }
        else {
            return super.has(key) ? super.get(key).get(id) : null;
        }
    }

    set(id, key, value) {
        if (!super.has(key)) {
            super.set(key, new Collection());
        }

        super.get(key).set(id, value);
    }

    has(id, key) {
        return key != null && super.has(key) && super.get(key).has(id);
    }

    async save() {
        const data = [];

        for (const key of this.keys()) {
            data.push([key, Array.from(super.get(key).entries())]);
        }
    
        await this.database.set(this.key, data);
    }

    async load() {
        const data = await this.database.get(this.key);

        if (data == null) return;

        for (const [key, entries] of data) {
            super.set(key, new Collection(entries));
        }
    }
}

class GridData extends IDData {
    constructor(key, database, length, width) {
        super(key, database);
        
        this.length = length;
        this.width = width;
    }

    get(x, y, key) {
        return super.get(`${x},${y}`, key);
    }

    set(x, y, key, value) {
        super.set(`${x},${y}`, key, value);
    }

    has(x, y, key) {
        return super.has(`${x},${y}`, key);
    }
}

module.exports = {
    Data: Data,
    IDData: IDData,
    GridData: GridData
}