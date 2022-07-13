const { Data } = require("./data");

class Data2L extends Data {
    constructor(key, database) {
        super(key, database);
    }

    get(id, key) {
        if (key == null) {
            const data = {};

            for (const key of this.keys()) {
                data[key] = super.get(key)[id];
            }

            return data;
        }
        else {
            return id == null ? super.get(key) : super.get(key)?.[id];
        }
    }

    set(id, key, value) {
        if (!this.has(key)) {
            super.set(key, {});
        }

        super.get(key)[id] = value;
    }
}

module.exports = { 
    Data2L: Data2L 
}