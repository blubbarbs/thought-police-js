const { RedisStore, Redis1DStore, Redis2DStore } = require('../data/redis_store.js');

class Game {
    constructor(name, redis) {
        this.name = name;
        this.settings = new Redis1DStore(redis, name, 'settings');
        this.playerData = new Redis2DStore(redis, name, 'player_data');
    }

    async saveGame() {
        const promises = [];

        for (const [key, value] of Object.entries(this)) {
            if (value instanceof RedisStore) {
                promises.push(value.sync());
            }
        }

        await Promise.all(promises);
    }

    async loadGame() {
        const promises = [];

        for (const [key, value] of Object.entries(this)) {
            if (value instanceof RedisStore) {
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