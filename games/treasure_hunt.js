const { GridGame } = require('./game/gridgame');
const { UserData } = require('@data');
const { randomGaussian, randomInt, roll } = require('@util/random');

const GAME_NAME = 'treasure_hunt';
const GRID_LENGTH = 10;
const GRID_WIDTH = 10;
const COOLDOWN_TIMER_MINS = 1200;
const MIN_POINT_ROLLS = 5;
const MAX_POINT_ROLLS = 10;
const MIN_FREEDIG_ROLLS = 3;
const MAX_FREEDIG_ROLLS = 5;
const MIN_POINTS = 300;
const MAX_POINTS = 500;
const MIN_POINTS_JACKPOT = 750;
const MAX_POINTS_JACKPOT = 1000;
const JACKPOT_PROBABILITY = .05;

class TreasureHuntGame extends GridGame {
    constructor(redis) {
        super(GAME_NAME, redis);

        this.tileTreasureData = this.tileData.child('tile_treasure');
    }

    get jackpot() {
        return this.settings.get('jackpot');
    }

    set jackpot(jackpot) {
        return this.settings.set('jackpot', jackpot);
    }

    isTileDug(tileID) {
        return this.tileData.child('is_dug').get(tileID) == true;
    }

    getTileTreasure(tileID) {
        const treasure = {};

        for (const treasureCache of this.tileTreasureData.children()) {
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
        return UserData.child('free_digs').get(id) || 0;
    }

    addFreeDigs(id, freeDigs) {
        UserData.child('free_digs').add(id, freeDigs);
    }

    getMinutesTillNextDig(id) {
        const lastDigTime = this.playerData.child('last_dig_time').get(id);

        if (lastDigTime == null) return 0;

        const msDifference = Date.now() - lastDigTime;
        const minutesDifference = Math.floor(msDifference / 60000);
        const minutesTill = COOLDOWN_TIMER_MINS - minutesDifference;

        return minutesTill > 0 ? minutesTill : 0;
    }

    getTreasureTilesLeft() {
        const treasureTiles = this.findTiles((tileID) => this.getTileTreasure(tileID) != null && !this.isTileDug(tileID));

        return treasureTiles.length;
    }

    getTreasuresLeft(treasureName) {
        let left = 0;

        for (const tileID of this.tiles()) {
            const treasureAmount = this.tileTreasureData.child(treasureName).get(tileID) || 0;

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
            color: this.jackpot ? '#ebf2a0' : '#bccbeb',
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

            this.tileTreasureData.child(treasureName).set(tileID, treasureAmount);
        }
    }

    dig(id, tileID) {
        const treasure = this.getTileTreasure(tileID);
        this.tileDisplayData.set(tileID, treasure != null ? '⭕' : '✖️');
        this.tileData.child('is_dug').set(tileID, true);
        this.playerData.child('last_dig_time').set(id, Date.now());

        return treasure;
    }

    newGame() {
        this.playerData.clear(true);
        this.tileData.clear(true);
        this.length = GRID_LENGTH;
        this.width = GRID_WIDTH;

        if (roll(JACKPOT_PROBABILITY)) {
            const jackpotAmount = randomInt(MAX_POINTS_JACKPOT, MIN_POINTS_JACKPOT);
            const numFreeDigRolls = randomInt(MAX_FREEDIG_ROLLS, MIN_FREEDIG_ROLLS) * 2;

            this.distributeTreasure(1, 'points', jackpotAmount);
            this.distributeTreasure(numFreeDigRolls, 'free_digs', 1);
            this.jackpot = true;
            this.defaultTileDisplay =  '🟨';
        }
        else {
            const numPointRolls = randomInt(MAX_POINT_ROLLS, MIN_POINT_ROLLS);
            const averagePoints = randomInt(MAX_POINTS, MIN_POINTS) / numPointRolls;
            const numFreeDigRolls = randomInt(MAX_FREEDIG_ROLLS, MIN_FREEDIG_ROLLS);

            this.distributeTreasure(numPointRolls, 'points', () => Math.round(randomGaussian(averagePoints, averagePoints * .2)));
            this.distributeTreasure(numFreeDigRolls, 'free_digs', 1);
            this.jackpot = true;
            this.defaultTileDisplay = '🔲';
        }
    }
}

module.exports = {
    TreasureHuntGame: TreasureHuntGame
}