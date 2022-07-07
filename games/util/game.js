const { Collection } = require("discord.js");
const { HashDataHandler } = require("../../handlers/redis_data_handler");
const { Grid } = require("./grid");

class Game {
    constructor(client, name) {
        this.name = name;
        this.client = client;
        this.dataHandler = new HashDataHandler(client.redis, name);
        this.data = new Collection();
        this.playerData = new Collection();
    }

    randomInt(max, min) {
        min = min != null ? min : 0;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    roll(probability) {
        return Math.random() < probability;
    }

    getData(key) {
        return this.data.get(key);
    }

    setData(key, value) {
        this.data.set(key, value);
    }

    getPlayerData(id, key) {
        return this.playerData.has(id) ? this.playerData.get(id).get(key) : null;
    }

    setPlayerData(id, key, value) {
        this.playerData.ensure(id, () => new Collection()).set(key, value);
    }

    async newGame() {
        this.data.clear();
        this.playerData.clear();
    }

    async loadGame() {
        const data = await this.dataHandler.get('data');
        const playerData = await this.dataHandler.get('player_data');

        if (data != null) {
            this.data = new Collection(data);
        }

        if (playerData != null) {
            this.playerData = new Collection();

            for (const [key, data] of playerData) {
                this.playerData.set(key, new Collection(data));
            }
        }
    }

    async saveGame() {
        const dataEntries = Array.from(this.data.entries());
        const playerEntries = [];
        
        for (const [key, data] of this.playerData.entries()) {
            playerEntries.push([key, Array.from(data.entries())]);
        }

        await this.dataHandler.sets( { data: dataEntries, 'player_data': playerEntries });
    }
}

class GridGame extends Game {
    constructor(client, name, length, width) {
        super(client, name);

        this.grid = new Grid(length, width);
    }

    resetTile(x, y) {
        this.grid.delete(x, y);
    }

    resetTileDisplay(x, y) {
        this.grid.delete(x, y, 'display');
    }

    getTileDisplay(x, y) {
        return this.grid.get(x, y, 'display') || this.grid.defaultTileDisplay;
    }

    setTileDisplay(x, y, display) {
        this.grid.set(x, y, 'display', display);
    }

    getTileData(x, y, key) {
        return this.grid.get(x, y, key);
    }

    setTileData(x, y, key, value) {
        this.grid.set(x, y, key, value);
    }

    randomTile(amount, predicate) {
        amount = amount != null ? amount : 1;
        const tilePool = [];

        for (let y = 0; y < this.grid.width; y++) {
            for (let x = 0; x < this.grid.length; x++) {
                if (predicate == null || predicate(x, y, this.grid.get(x, y))) {                    
                    tilePool.push([x, y]);
                }                
            }
        }
        
        const tiles = [];

        for (let i = 0; i < amount; i++) {
            const randomIndex = this.randomInt(tilePool.length - 1);
            const tile = tilePool.splice(randomIndex, 1);

            tiles.push(tile[0]);
        }

        return tiles.length == 1 ? tiles[0] : tiles;
    }

    async newGame() {
        await super.newGame();

        this.grid.clear();
    }

    async loadGame() {
        await super.loadGame();
        
        const grid = await this.dataHandler.get('grid');

        if (grid != null) {
            this.grid.grid = grid.grid;
        }
    }

    async saveGame() {
        await super.saveGame();

        await this.dataHandler.set('grid', this.grid);
    }
}

module.exports = {
    Game: Game,
    GridGame: GridGame
}