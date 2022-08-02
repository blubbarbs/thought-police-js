const { randomInt } = require("../util/random");
const { getNumberEmoji, getLetterEmoji } = require('../util/emoji');
const { Game } = require("./game");

class GridGame extends Game {
    constructor(name, data, length, width, defaultDisplay = '🔲' ) {
        super(name, data);

        this.gridData = this.gameData.getNamespace('grid_data');
        this.length = length;
        this.width = width;
        this.defaultDisplay = defaultDisplay;
    }

    getTileData(key, x, y) {
        return this.gridData.get(key, `${x},${y}`);
    }

    setTileData(key, x, y, value) {
        this.gridData.set(key, `${x},${y}`, value);
    }

    clearTileData(key, x, y) {
        this.gridData.delete(key, `${x},${y}`);
    }

    getTileDisplay(x, y) {
        return this.getTileData('display', x, y) || this.defaultDisplay;
    }

    setDefaultTileDisplay(display) {
        this.gameData.set('default_tile_display', display);
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
        return this.randomTiles(1, predicate)[0];
    }

    toString() {
        let str = '↘️';

        for (let x = 0; x < this.length; x++) {
            str += getNumberEmoji(x);
        }

        str += '\n';

        for (let y = 0; y < this.width; y++) {
            str += getLetterEmoji(y);

            for (let x = 0; x < this.length; x++) {
                const display = this.getTileDisplay(x, y);

                str += display;
            }
            
            str += '\n';
        }
    
        return str;
    }

    *tiles() {
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                yield [x, y];
            }
        }
    }
}

module.exports = {
    GridGame: GridGame
}