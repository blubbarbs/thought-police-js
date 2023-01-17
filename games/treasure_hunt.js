const { RedisStore } = require('../data/redis_store.js');
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
        super(GAME_NAME, redis, GRID_LENGTH, GRID_WIDTH);

        this.tileTreasureData = new RedisStore(redis, GAME_NAME, 'tile_treasure');
    }

    getMinutesTillNextDig(id) {
        const lastDigTime = this.playerData.get(id, 'last_dig_time');

        if (lastDigTime != null) {
            const msDifference = Date.now() - lastDigTime;
            const minutesDifference = Math.floor(msDifference / 60000);
            const minutesTill = COOLDOWN_TIMER_MINS - minutesDifference;

            return minutesTill > 0 ? minutesTill : 0;
        }
        else {
            return 0;
        }
    }

    getTreasureTilesLeft() {
        const treasureTiles = this.findTiles((x, y) => this.tileTreasureData.hasID([x, y]));

        return treasureTiles.length;
    }

    getTreasuresLeft(treasureName) {
        let left = 0;

        for (const [x, y] of this.tiles()) {
            const treasureAmount = this.tileTreasureData.get([x, y], treasureName);

            if (treasureAmount != null && treasureAmount > 0) {
                left += treasureAmount;
            }
        }

        return left;
    }

    calculateChestPercentage() {
        const numChests = this.getTreasureTilesLeft();
        const numFreeSpaces = this.findTiles((x, y) => this.tileData.get([x, y], 'is_dug') != true);

        return (numChests / numFreeSpaces) * 100;
    }

    getBoardEmbed() {
        const embed = {
            color: this.isJackpot() ? '#ebf2a0' : '#bccbeb',
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
            const [x, y] = this.randomTile();
            const treasureAmount = typeof treasureAmountGenerator == 'function' ? treasureAmountGenerator(x, y) : treasureAmountGenerator;

            this.tileTreasureData.add([x, y], treasureName, treasureAmount);
        }
    }

    dig(id, x, y) {
        const tileID = [x, y];
        const treasure = this.tileTreasureData.gets(tileID);

        if (this.tileTreasureData.hasID(tileID)) {
            this.tileDisplayData.set(tileID, '⭕');
            this.tileTreasureData.delete(tileID);
        }
        else {
            this.tileDisplayData.set(tileID, '✖️');
        }

        this.playerData.set(id, 'last_dig_time', Date.now());
        this.tileData.set(tileID, 'is_dug', true);

        return treasure;
    }

    async newGame() {
        this.playerData.stores.get('last_dig_time').clear();
        this.tileData.clear();
        this.tileDisplayData.clear();

        this.settings.set('length', GRID_LENGTH);
        this.settings.set('width', GRID_WIDTH);
        this.settings.set('default_tile_display', '🔲');

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
        }

        await this.saveGame();
    }
}

module.exports = {
    TreasureHuntGame: TreasureHuntGame
}