const { randomInt } = require("@util/random");
const { getNumberEmoji, getLetterEmoji } = require('@util/emoji');
const { toAlphanumeric } = require('@util/grid_coords');
const { DataHandler } = require("@handlers");
const { Game } = require("./game");

class GridGame extends Game {
    constructor(name, redis) {
        super(name, redis);

        this.tileData = DataHandler.cache(name, 'tile_data');
        this.tileDisplayData = this.tileData.subcache('tile_display');
    }

    get length() {
        return this.settings.get('length');
    }

    get width() {
        return this.settings.get('width');
    }

    get defaultTileDisplay() {
        return this.settings.get('default_tile_display');
    }

    set length(length) {
        this.settings.set('length', length);
    }

    set width(width) {
        this.settings.set('width', width);
    }

    set defaultTileDisplay(defaultDisplay) {
        this.settings.set('default_tile_display', defaultDisplay);
    }

    findTiles(predicate) {
        const filteredTiles = [];

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                const tileID = toAlphanumeric(x, y);

                if (predicate == null || predicate(tileID)) {
                    filteredTiles.push(tileID);
                }
            }
        }

        return filteredTiles;
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
                const display = this.tileDisplayData.get(toAlphanumeric(x, y)) || this.defaultTileDisplay;

                str += display;
            }

            str += '\n';
        }

        return str;
    }

    *tiles() {
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                yield toAlphanumeric(x, y);
            }
        }
    }
}

module.exports = {
    GridGame: GridGame
}