class RedisDataHandler {
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

    async delete(id, ...keys) {
        if (keys.length == 0) {
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

    async set(id, newData) {
        let data = await this.get(id);
        data = Object.assign(data, newData);

        await this.redis.hSet(this.hash, id, JSON.stringify(data));
    }
}

module.exports = {
    RedisDataHandler: RedisDataHandler
}