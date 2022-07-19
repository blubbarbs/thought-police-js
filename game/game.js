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

    clearData(key) {
        this.gameData.cacheDelete(key);
    }

    getPlayerData(key, id) {
        return this.playerData.cacheGet(key, id);
    }

    setPlayerData(key, id, value) {
        this.playerData.cacheSet(key, id, value);
    }

    clearPlayerData(key, id) {
        this.playerData.cacheDelete(key, id);
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