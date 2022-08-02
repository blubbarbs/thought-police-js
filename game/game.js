class Game {
    constructor(name, data) {
        this.name = name;
        this.gameData = data.getNamespace(name);
        this.playerData = this.gameData.getNamespace('player_data');
    }

    getData(key) {
        return this.gameData.get(key);
    }

    setData(key, value) {
        this.gameData.set(key, value);
    }

    clearData(key) {
        this.gameData.delete(key);
    }

    getPlayerData(key, id) {
        return this.playerData.get(key, id);
    }

    setPlayerData(key, id, value) {
        this.playerData.set(key, id, value);
    }

    clearPlayerData(key, id) {
        this.playerData.delete(key, id);
    }

    async saveGame() {
        await this.gameData.saveDeep();
    }

    async loadGame() {
        await this.gameData.loadDeep();
    }
}

module.exports = {
    Game: Game
}