const { createClient } = require('redis');
const { RedisObjectProxy  } = require('./object_wrapper');

class DataHandler {
    static {
        this.cache = null;
        this.redis = createClient({ url: process.env.REDIS_URL });
    }

    static async fetchAll() {
        const initialObject = this.redis.json.get('data', { path: '$'});

        this.cache = new RedisObjectProxy(this.redis, 'data', initialObject);
    }
}

module.exports = {
    DataHandler: DataHandler
}