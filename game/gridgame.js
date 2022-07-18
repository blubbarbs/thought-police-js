const { randomInt } = require("../util/random");
const { getNumberEmoji, getLetterEmoji } = require('../util/emoji');
const { Game } = require("./game");

class GridGame extends Game {
    constructor(name, database, length, width, defaultDisplay = '🔲' ) {
        super(name, database);

        this.gridData = this.gameData.getNamespace('grid_data');

        this.setData('length', length);
        this.setData('width', width);
        this.setData('default_tile_display', defaultDisplay);
    }

    getLength() {
        return this.gameData.cacheGet('length');
    }

    getWidth() {
        return this.gameData.cacheGet('width');
    }

    getDefaultTileDisplay() {
        return this.gameData.cacheGet('default_tile_display');
    }

    getTileData(key, x, y) {
        return this.gridData.cacheGet(key, `${x},${y}`);
    }

    setTileData(key, x, y, value) {
        this.gridData.cacheSet(key, `${x},${y}`, value);
    }

    getTileDisplay(x, y) {
        return this.getTileData('display', x, y) || this.getDefaultTileDisplay();
    }

    setDefaultTileDisplay(display) {
        this.gameData.cacheSet('default_tile_display', display);
    }

    setTileDisplay(x, y, display) {
        this.setTileData('display', x, y, display);
    }

    findTiles(predicate) {
        const tiles = [];

        for (const [x, y] of this.tiles()) {
            if (predicate == null || predicate(x, y)) {                    
                tiles.push([x, y]);
            }                
        }

        return tiles;
    }

    randomTiles(amount, predicate) {
        const tilePool = this.findTiles(predicate);        
        const tiles = [];
    
        for (let i = 0; i < amount; i++) {
            const randomIndex = randomInt(tilePool.length - 1);
            const tile = tilePool.splice(randomIndex, 1);
    
            tiles.push(tile[0]);
        }
    
        return tiles;
    }
    
    randomTile(predicate) {
        return this.randomTiles(predicate)[0];
    }

    toString() {
        let str = '❎';

        for (let x = 0; x < this.getLength(); x++) {
            str += getNumberEmoji(x);
        }

        str += '\n';

        for (let y = 0; y < this.getWidth(); y++) {
            str += getLetterEmoji(y);

            for (let x = 0; x < this.getLength(); x++) {
                const display = this.getTileDisplay(x, y);

                str += display;
            }
            
            str += '\n';
        }
    
        return str;
    }

    *tiles() {
        for (let y = 0; y < this.getWidth(); y++) {
            for (let x = 0; x < this.getLength(); x++) {
                yield [x, y];
            }
        }
    }
}

module.exports = {
    GridGame: GridGame
}