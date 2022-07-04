function dateReviver(key, value) {
    if (Date.parse(value) != 'NaN') {
        return new Date(value);
    }

    return value;
}

class HashDataHandler {
    constructor(redis, hash) {
        this.redis = redis;
        this.hash = hash;
    }

    async get(id, ...keys) {
        if (id != null) {
            let data = await this.redis.hGet(this.hash, id);
            data = data == null ? {} : JSON.parse(data);

            if (keys.length == 0) {
                return data;
            }
            else if (keys.length == 1) {
                const key = keys[0];
    
                return key in data ? data[key] : null;
            }
            else {            
                const keyedData = {};

                for (const key of keys) {
                    keyedData[key] = key in data ? data[key] : null;
                }
                
                return keyedData;
            }    
        }
        else {
            const allData = await this.redis.hGetAll(this.hash);
            
            for (const [id, data] of Object.entries(allData)) {
                allData[id] = JSON.parse(data);
            }

            return Object.keys(allData).length > 0 ? allData : {};
        }
    }

    async set(id, newData) {
        let data = await this.get(id);
        data = Object.assign(data, newData);

        await this.redis.hSet(this.hash, id, JSON.stringify(data));
    }

    async delete(id, ...keys) {
        if (id == null) {
            await this.redis.del(this.hash);
        }
        else if (keys.length == 0) {
            await this.redis.hDel(this.hash, id);
        }
        else { 
            const data = await this.get(id);      
        
            for (const key of keys) {
                delete data[key];
            }

            await this.redis.hSet(this.hash, id, JSON.stringify(data));
        }
    }
}

class KeyedDataHandler {
    constructor (redis) {
        this.redis = redis;
    }

    async get(...keys) {
        if (keys.length == 0) {
            return null;
        }
        else if (keys.length == 1) {
            const data = await this.redis.get(keys[0]);
            
            return JSON.parse(data);
        }
        else {
            let allData = {};

            for (const key of keys) {
                const data = await this.redis.get(key);
                
                allData[key] = JSON.parse(data);
            }

            return allData;
        }
    }

    async set(data) {
        for (const [key, value] of Object.entries(data)) {
            await this.redis.set(key, JSON.stringify(value));
        }        
    }

    async delete(...keys) {
        for (const key of keys) {
            await this.redis.del(key);
        }
    }
}

module.exports = {
    HashDataHandler: HashDataHandler,
    KeyedDataHandler: KeyedDataHandler
}