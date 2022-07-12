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

module.exports = {
    Data: Data
}