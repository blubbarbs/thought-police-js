const { GridGame } = require('../game/gridgame.js');
const { randomInt, roll } = require('../util/random.js');

const GRID_LENGTH = 10;
const GRID_WIDTH = 10;
const COOLDOWN_TIMER_MINS = 1200;
const MIN_TREASURES = 1;
const MAX_TREASURES = 4;
const MIN_POINTS = 30;
const MAX_POINTS = 50;
const JACKPOT_PROBABILITY = .05;
const MIN_POINTS_JACKPOT = 75;
const MAX_POINTS_JACKPOT = 100;

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
    
    hasUsedDailyDig(id) {
        return this.getMinutesTillNextDig(id) > 0;
    }
    
    isJackpot() {
        return this.getData('jackpot') == true;
    }

    getBoardEmbed() {
        const embed = {
            color: '#ebf2a0',
            title: 'Treasure Hunt!',
            fields: [
                {
                    name: 'Treasure Available',
                    value: `${this.getData('treasure')} points`,
                    inline: false
                },
                {
                    name: 'Treasure Chests Left',
                    value: `${this.getData('treasures_left')} chest(s)`,
                    inline: false
                }
            ],
            description: this.toString()
        }
    
        return embed;
    }

    async newGame() {
        this.playerData.getNamespace('last_dig_time').cacheClear();
        this.gridData.cacheClear(true);
        
        if (roll(JACKPOT_PROBABILITY)) {
            const [jackpotX, jackpotY] = this.randomTile();
            const jackpotAmount = randomInt(MAX_POINTS_JACKPOT, MIN_POINTS_JACKPOT);
    
            this.setTileData('treasure', jackpotX, jackpotY, jackpotAmount);
            this.setData('treasures_left', 1);
            this.setData('treasure', jackpotAmount);
            this.setData('jackpot', true);
            this.setData('default_tile_display', '🟨');
        }
        else {
            const numTreasures = randomInt(MAX_TREASURES, MIN_TREASURES);
            const treasureTiles = this.randomTiles(numTreasures);
            const totalTreasureAmount = randomInt(MAX_POINTS, MIN_POINTS);
            let treasurePool = totalTreasureAmount;
    
            for (let i = 0; i < treasureTiles.length - 1; i++) {
                const [x, y] = treasureTiles[i];
                const treasureAmount = randomInt(Math.floor(treasurePool * .8), Math.ceil(treasurePool * .2));
                treasurePool -= treasureAmount;
    
                this.setTileData('treasure', x, y, treasureAmount);
            }
    
            const [finalX, finalY] = treasureTiles[treasureTiles.length - 1];
    
            this.setTileData('treasure', finalX, finalY, treasurePool);
            this.setData('treasure', totalTreasureAmount);
            this.setData('treasures_left', numTreasures);
        }

        await this.saveGame();
    }    
            
    async dig(id, x, y) {
        const treasure = this.getTileData('treasure', x, y);
    
        if (treasure != null) {
            this.setTileDisplay(x, y, '⭕');
            this.setData('treasure', this.getData('treasure') - treasure);
            this.setData('treasures_left', this.getData('treasures_left') - 1);
        }
        else {
            this.setTileDisplay(x, y, '❌');
        }
    
        this.setTileData('is_dug', x, y, true);
    
        if (this.hasUsedDailyDig(id)) {
            this.setPlayerData('free_digs', id, this.getFreeDigs(id) - 1);
        }
        else {
            this.setPlayerData('last_dig_time', id, Date.now());
        }
    
        await this.saveGame();
    
        return treasure;
    }    
}

module.exports = {
    TreasureHuntGame: TreasureHuntGame
}