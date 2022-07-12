const { Collection } = require("discord.js");
const { Data } = require("./data");

class Data2L extends Data {
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

    clear(key) {
        if (key == null) {
            super.clear();
        }
        else if (super.has(key)) {
            super.get(key).clear();
        }
    }

    async save() {
        const data = [];

        for (const key of this.keys()) {
            const value = super.get(key);

            data.push([key, Array.from(value.entries())]);
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

module.exports = { 
    Data2L: Data2L 
}