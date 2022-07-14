class HashWrapper {
    constructor(database, hash) {
        this.database = database;
        this.hash = hash;
    }

    async keys() {    
        return this.database.hashKeys(this.hash);
    }

    async get(key) {
        return this.database.hashGet(this.hash, key);
    }

    async gets(...keys) {        
        return this.database.hashGets(this.hash, ...keys);
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