class Data {
    constructor(key, database) {        
        this.data = {};
        this.key = key;
        this.database = database;
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
    }

    clear(key) {
        if (this.key == null) {
            delete this.data;
        }
        else {
            delete this.data[key];
        }
    }

    has(key) {
        return this.data[key] != null;
    }

    keys() {
        return Object.keys(this.data);
    }

    values() {
        return Object.values(this.data);
    }

    entries() {
        return Object.entries(this.data);
    }

    async save() {
        const savedData = {};

        Object.assign(savedData, this);

        delete savedData.key;
        delete savedData.database;

        await this.database.set(this.key, savedData);
    }

    async load() {
        const loadedData = await this.database.get(this.key);
        
        Object.assign(this, loadedData);
    }
}

module.exports = {
    Data: Data
}