const { DataHandler } = require('@handlers');

class Game {
    constructor(name) {
        this.name = name;
        this.settings = DataHandler.cache(name, 'settings');
        this.playerData = DataHandler.cache(name, 'player_data');
    }

    newGame() {}

    startGame() {}

    endGame() {}
}

module.exports = {
    Game: Game
}