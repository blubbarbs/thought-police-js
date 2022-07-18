const { Collection } = require("discord.js");

class Game {
    constructor(name, database) {
        this.name = name;
        this.gameData = database.getNamespace(name);
        this.playerData = this.gameData.getNamespace('player_data');
    }

    getData(key) {
        return this.gameData.cacheGet(key);
    }

    setData(key, value) {
        this.gameData.cacheSet(key, value);
    }

    getPlayerData(key, id) {
        return this.playerData.cacheGet(key, id);
    }

    setPlayerData(key, id, value) {
        this.playerData.cacheSet(key, id, value);
    }

    async saveGame() {
        await this.gameData.saveAllCache();
    }

    async loadGame() {
        await this.gameData.loadAllCache();
    }
}

module.exports = {
    Game: Game
}