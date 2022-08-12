const { GridGame } = require('../game/gridgame.js');
const { randomGaussian, randomInt, roll } = require('../util/random.js');

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
    constructor(database) {
        super('treasure_hunt', database, GRID_LENGTH, GRID_WIDTH);
    }
        
    getMinutesTillNextDig(id) {
        const lastDigTime = this.getPlayerData('last_dig_time', id);
    
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
    
    getFreeDigs(id) {
        return this.getPlayerData('free_digs', id) || 0;
    }
    
    addFreeDigs(id, deltaDigs) {
        this.setPlayerData('free_digs', id, this.getFreeDigs(id) + deltaDigs);
    }

    hasUsedDailyDig(id) {
        return this.getMinutesTillNextDig(id) > 0;
    }
    
    isJackpot() {
        return this.getData('jackpot') == true;
    }

    calculateChestPercentage() {
        const numChests = this.getTreasureTilesLeft();
        const numFreeSpaces = this.findTiles((x, y) => !this.getTileData('is_dug', x, y)).length;

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

    getTreasureTilesLeft() {
        return this.gridData.getNamespace('treasure').size;
    }

    getTreasuresLeft(treasureName) {
        let left = 0;

        for (const treasure of this.gridData.getNamespace('treasure').values()) {
            left += treasure[treasureName] || 0;
        }

        return left;
    }

    distributeTreasure(numRolls, treasureName, treasureAmountGenerator) {
        for (let i = 0; i < numRolls; i++) {
            const [x, y] = this.randomTile();
            const treasure = this.getTileData('treasure', x, y) || {};
            const treasureAmount = typeof treasureAmountGenerator == 'function' ? treasureAmountGenerator(x, y) : treasureAmountGenerator;

            treasure[treasureName] = treasureName in treasure ? treasure[treasureName] + treasureAmount : treasureAmount;
            this.setTileData('treasure', x, y, treasure);
        }
    }

    dig(id, x, y) {
        const treasure = this.getTileData('treasure', x, y);
    
        if (treasure != null) {
            this.setTileDisplay(x, y, '⭕');
            this.clearTileData('treasure', x, y);
        }
        else {
            this.setTileDisplay(x, y, '✖️');
        }
    
        this.setPlayerData('last_dig_time', id, Date.now());
        this.setTileData('is_dug', x, y, true);
    
        return treasure;
    }

    async loadGame() {
        await super.loadGame();

        if (this.isJackpot()) {
            this.setDefaultTileDisplay('🟨');
        }
    }

    async newGame() {
        this.playerData.getNamespace('last_dig_time').clear();
        this.gridData.clearDeep();
        
        if (roll(JACKPOT_PROBABILITY)) {
            const jackpotAmount = randomInt(MAX_POINTS_JACKPOT, MIN_POINTS_JACKPOT);
            const numFreeDigRolls = randomInt(MAX_FREEDIG_ROLLS, MIN_FREEDIG_ROLLS) * 2;

            this.distributeTreasure(1, 'points', jackpotAmount);
            this.distributeTreasure(numFreeDigRolls, 'free_digs', 1);
            this.setData('jackpot', true);
            this.setData('default_tile_display', '🟨');
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