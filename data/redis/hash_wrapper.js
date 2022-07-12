class HashWrapper {
    constructor(database, hash) {
        this.database = database;
        this.hash = hash;
    }

    async keys() {    
        return this.database.hashKeys(this.hash);
    }

    async get(...keys) {        
        return this.database.hashGet(this.hash, ...keys);
    }

    async set(key, value) {
        return this.database.hashSet(this.hash, key, value);
    }

    async sets(data) {
        return this.database.hashSets(this.hash, data);
    }

}

module.exports = {
    HashWrapper: HashWrapper
}