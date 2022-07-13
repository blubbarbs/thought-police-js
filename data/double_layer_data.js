const { Data } = require("./data");

class Data2L extends Data {
    constructor(key, database) {
        super(key, database);
    }

    get(key1, key2) {
        return key2 == null ? this.data[key1] : this.data[key1]?.[key2];
    }

    set(key1, key2, value) {
        if (!this.has(key1)) {
            this.data[key1] = {};
        }

        this.data[key1][key2] = value;
    }
}

module.exports = { 
    Data2L: Data2L 
}