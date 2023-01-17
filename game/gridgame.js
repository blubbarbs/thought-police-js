const { randomInt } = require("../util/random");
const { getNumberEmoji, getLetterEmoji } = require('../util/emoji');
const { toCoordinates, toAlphanumeric } = require('../util/grid_coords');
const { Game } = require("./game");
const { RedisStore, RedisCache } = require("../data/redis_store");

class Point {
    static toString(x, y) {
        return `${x},${y}`;
    }

    static fromString(string) {
        return Point.fromCoordinates(...string.split(','));
    }

    static fromCoordinates(x, y) {
        return [+x, +y];
    }

    static fromAlphanumeric(alphanumeric) {
        return toCoordinates(alphanumeric);
    }
}

class GridGame extends Game {
    constructor(name, redis) {
        super(name, redis);

        this.tileData = new RedisStore(redis, name, 'tile_data');
        this.tileDisplayData = new RedisCache(redis, name, 'tile_display');

        this.settings.set('length', length);
        this.settings.set('width', width);
        this.length = length;
        this.width = width;
        this.defaultTileDisplay = defaultTileDisplay;
    }

    findTiles(predicate) {
        const filteredTiles = [];

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                if (predicate == null || predicate(x, y)) {
                    filteredTiles.push([x, y]);
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

    getGridString() {
        let str = '↘️';

        for (let x = 0; x < this.length; x++) {
            str += getNumberEmoji(x);
        }

        str += '\n';

        for (let y = 0; y < this.width; y++) {
            str += getLetterEmoji(y);

            for (let x = 0; x < this.length; x++) {
                const display = this.tileDisplayData.get(Point.toString(x, y)) || defaultDisplay;

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
    GridGame: GridGame,
    Point: Point
}