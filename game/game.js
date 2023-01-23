const { RedisCache, Redis1DCache, Redis2DCache } = require('../data/redis_cache.js');

class Game {
    constructor(name, redis) {
        this.name = name;
        this.settings = new Redis1DCache(redis, name, 'settings');
        this.playerData = new Redis2DCache(redis, name, 'player_data');
    }

    async saveGame() {
        const promises = [];

        for (const [key, value] of Object.entries(this)) {
            if (value instanceof RedisCache) {
                promises.push(value.sync());
            }
        }

        await Promise.all(promises);
    }

    async loadGame() {
        const promises = [];

        console.log('Loading...');

        for (const [key, value] of Object.entries(this)) {
            if (value instanceof RedisCache) {
                console.log(`Fetching ${key}`);
                promises.push(value.fetch());
            }
        }

        await Promise.all(promises);
    }

    async newGame() {}

    async startGame() {}

    async endGame() {}
}

module.exports = {
    Game: Game
}