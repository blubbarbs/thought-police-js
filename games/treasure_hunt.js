const { DataHandler } = require('../handlers/data_handler');
const { GridGame } = require('../game/gridgame.js');
const { randomGaussian, randomInt, roll } = require('../util/random.js');

const GAME_NAME = 'treasure_hunt';
const GRID_LENGTH = 10;
const GRID_WIDTH = 10;
const COOLDOWN_TIMER_MINS = 1200;
const MIN_POINT_ROLLS = 5;
const MAX_POINT_ROLLS = 10;
const MIN_FREEDIG_ROLLS = 3;
const MAX_FREEDIG_ROLLS = 5;
const MIN_POINTS = 30;
const MAX_POINTS = 50;
const MIN_POINTS_JACKPOT = 75;
const MAX_POINTS_JACKPOT = 100;
const JACKPOT_PROBABILITY = .05;

class TreasureHuntGame extends GridGame {
    constructor(redis) {
        super(GAME_NAME, redis);

        this.tileTreasureData = DataHandler.cache(GAME_NAME, 'tile_treasure');
    }

    isTileDug(tileID) {
        return this.tileData.get('is_dug', tileID) == true;
    }

    getTileTreasure(tileID) {
        const treasure = {};

        for (const treasureCache of this.tileTreasureData.subcaches()) {
            const value = treasureCache.get(tileID);

            if (value) {
                treasure[treasureCache.name] = value;
            }
        }

        return Object.keys(treasure).length > 0 ? treasure : null;
    }

    hasDailyDig(id) {
        return this.getMinutesTillNextDig(id) == 0;
    }

    getFreeDigs(id) {
        return this.playerData.get('free_digs', id);
    }

    getMinutesTillNextDig(id) {
        const lastDigTime = this.playerData.get('last_dig_time', id);

        if (lastDigTime == null) return 0;

        const msDifference = Date.now() - lastDigTime;
        const minutesDifference = Math.floor(msDifference / 60000);
        const minutesTill = COOLDOWN_TIMER_MINS - minutesDifference;

        return minutesTill > 0 ? minutesTill : 0;
    }

    getTreasureTilesLeft() {
        const treasureTiles = this.findTiles((tileID) => this.getTileTreasure(tileID) != null);

        return treasureTiles.length;
    }

    getTreasuresLeft(treasureName) {
        let left = 0;

        for (const tileID of this.tiles()) {
            const treasureAmount = this.tileTreasureData.get(treasureName, tileID) || 0;

            if (!this.isTileDug(tileID) && treasureAmount > 0) {
                left += treasureAmount;
            }
        }

        return left;
    }

    calculateChestPercentage() {
        const numChests = this.getTreasureTilesLeft();
        const numFreeSpaces = this.findTiles((tileID) => !this.isTileDug(tileID)).length;

        return (numChests / numFreeSpaces) * 100;
    }

    getBoardEmbed() {
        const embed = {
            color: this.settings.get('jackpot') == true ? '#ebf2a0' : '#bccbeb',
            title: 'Treasure Hunt!',
            fields: [
                {
                    name: 'Treasure Available',
                    value: `${this.getTreasuresLeft('points')} points`,
                    inline: false
                },
                {
                    name: 'Treasure Chests Left',
                    value: `${this.getTreasureTilesLeft()} chest(s)`,
                    inline: false
                },
                {
                    name: 'Chest Chance',
                    value: `${this.calculateChestPercentage().toFixed(2)}%`,
                    inline: false
                }
            ],
            description: this.toString()
        }

        return embed;
    }

    distributeTreasure(numRolls, treasureName, treasureAmountGenerator) {
        for (let i = 0; i < numRolls; i++) {
            const tileID = this.randomTile();
            const treasureAmount = typeof treasureAmountGenerator == 'function' ? treasureAmountGenerator(tileID) : treasureAmountGenerator;

            this.tileTreasureData.add(treasureName, tileID, treasureAmount);
        }
    }

    dig(id, tileID) {
        const treasure = this.getTileTreasure(tileID);
        this.tileDisplayData.set(tileID, treasure != null ? '⭕' : '✖️');
        this.tileData.set('is_dug', tileID, true);
        this.playerData.set('last_dig_time', id, Date.now());

        return treasure;
    }

    newGame() {
        this.playerData.subcache('last_dig_time')?.clear();
        this.tileData.clear(true);
        this.tileTreasureData.clear(true);
        this.tileDisplayData.clear(true);

        this.settings.set('length', GRID_LENGTH);
        this.settings.set('width', GRID_WIDTH);

        if (roll(JACKPOT_PROBABILITY)) {
            const jackpotAmount = randomInt(MAX_POINTS_JACKPOT, MIN_POINTS_JACKPOT);
            const numFreeDigRolls = randomInt(MAX_FREEDIG_ROLLS, MIN_FREEDIG_ROLLS) * 2;

            this.distributeTreasure(1, 'points', jackpotAmount);
            this.distributeTreasure(numFreeDigRolls, 'free_digs', 1);
            this.settings.set('jackpot', true);
            this.settings.set('default_tile_display', '🟨');
        }
        else {
            const numPointRolls = randomInt(MAX_POINT_ROLLS, MIN_POINT_ROLLS);
            const averagePoints = randomInt(MAX_POINTS, MIN_POINTS) / numPointRolls;
            const numFreeDigRolls = randomInt(MAX_FREEDIG_ROLLS, MIN_FREEDIG_ROLLS);

            this.distributeTreasure(numPointRolls, 'points', () => Math.round(randomGaussian(averagePoints, averagePoints * .2)));
            this.distributeTreasure(numFreeDigRolls, 'free_digs', 1);
            this.settings.set('jackpot', false);
            this.settings.set('default_tile_display', '🔲');
        }
    }
}

module.exports = {
    TreasureHuntGame: TreasureHuntGame
}