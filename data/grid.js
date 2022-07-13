const { Data2L } = require("./double_layer_data");
const { getLetterEmoji, getNumberEmoji } = require("../util/emoji.js");
const { randomInt } = require("../util/random");

class Grid extends Data2L {
    constructor(key, database, length = 10, width = 10, defaultDisplay = '🔲') {
        super(key, database);
        
        this.length = length;
        this.width = width;
        this.defaultDisplay = defaultDisplay;
    }

    get(key, x, y) {
        return super.get(key, `${x},${y}`);
    }

    getDisplay(x, y) {
        return this.get('display', x, y) || this.defaultDisplay;
    }

    set(key, x, y, value) {
        super.set(key, `${x},${y}`, value);
    }

    setDisplay(x, y, display) {
        this.set('display', x, y, display);
    }

    findTiles(predicate) {
        const tiles = [];

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                if (predicate == null || predicate(x, y)) {                    
                    tiles.push([x, y]);
                }                
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

        for (let x = 0; x < this.width; x++) {
            str += getNumberEmoji(x);
        }

        str += '\n';

        for (let y = 0; y < this.width; y++) {
            str += getLetterEmoji(y);

            for (let x = 0; x < this.length; x++) {
                const display = this.getDisplay(x, y);

                str += display;
            }
            
            str += '\n';
        }
    
        return str;
    }
}

module.exports = {
    Grid: Grid
}