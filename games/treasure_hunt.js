const { randomInt, randomTile, randomTiles, roll } = require('../util/random.js');
const { database } = require('../bot.js');
const { Data } = require('../data/data.js');
const { Data2L } = require('../data/double_layer_data.js');
const { Grid } = require('../data/grid.js');

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

class TreasureHunt {
    static {
        this.remoteData = database.createHash('treasure_hunt');
        this.data = new Data('data', this.remoteData);
        this.playerData = new Data2L('player_data', this.remoteData);
        this.grid = new Grid('grid', this.remoteData, GRID_LENGTH, GRID_WIDTH);
    }
    
    static getMinutesTillNextDig(id) {
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
    
    static getFreeDigs(id) {
        return this.playerData.get(id, 'free_digs') || 0;
    }
    
    static hasUsedDailyDig(id) {
        return this.getMinutesTillNextDig(id) > 0;
    }
    
    static isJackpot() {
        return this.data.get('jackpot') == true;
    }

    static getBoardEmbed() {
        const embed = {
            color: '#ebf2a0',
            title: 'Treasure Hunt!',
            fields: [
                {
                    name: 'Treasure Available',
                    value: `${this.data.get('treasure')} points`,
                    inline: false
                },
                {
                    name: 'Treasure Chests Left',
                    value: `${this.data.get('treasures_left')} chest(s)`,
                    inline: false
                }
            ],
            description: this.grid.toString()
        }
    
        return embed;
    }
    
    static async newGame() {
        this.grid.clear();
        this.playerData.clear('last_dig_time');
    
        if (roll(JACKPOT_PROBABILITY)) {
            const [jackpotX, jackpotY] = randomTile(this.grid, null);
            const jackpotAmount = randomInt(MAX_POINTS_JACKPOT, MIN_POINTS_JACKPOT);
    
            this.grid.set(jackpotX, jackpotY, 'treasure', jackpotAmount);
            this.data.set('treasures_left', 1);
            this.data.set('treasure', jackpotAmount);
            this.data.set('jackpot', true);
            this.grid.defaultTileDisplay = '🟨';
        }
        else {
            const numTreasures = randomInt(MAX_TREASURES, MIN_TREASURES);
            const treasureTiles = randomTiles(this.grid, numTreasures);
            const totalTreasureAmount = randomInt(MAX_POINTS, MIN_POINTS);
            let treasurePool = totalTreasureAmount;
    
            for (let i = 0; i < treasureTiles.length - 1; i++) {
                const [x, y] = treasureTiles[i];
                const treasureAmount = randomInt(Math.floor(treasurePool * .8), Math.ceil(treasurePool * .2));
                treasurePool -= treasureAmount;
    
                this.grid.set(x, y, 'treasure', treasureAmount);
            }
    
            const [finalX, finalY] = treasureTiles[treasureTiles.length - 1];
    
            this.grid.set(finalX, finalY, 'treasure', treasurePool);
            this.data.set('treasure', totalTreasureAmount);
            this.data.set('treasures_left', numTreasures);
        }
    }    
    
    static async saveGame() {
        await this.data.save();
        await this.playerData.save();
        await this.grid.save();
    }
    
    static async loadGame() {
        await this.data.load();
        await this.playerData.load();
        await this.grid.load();

        if (this.isJackpot()) {
            this.grid.defaultDisplay = '🟨';
        }
    }
        
    static async dig(id, x, y) {
        const treasure = this.grid.get(x, y, 'treasure');
    
        if (treasure != null) {
            this.grid.setDisplay(x, y, '⭕');
            this.data.set('treasure', this.data.get('treasure') - treasure);
            this.data.set('treasures_left', this.data.get('treasures_left') - 1);
        }
        else {
            this.grid.setDisplay(x, y, '❌');
        }
    
        this.grid.set(x, y, 'is_dug', true);
    
        if (this.hasUsedDailyDig(id)) {
            this.playerData.set(id, 'free_digs', this.getFreeDigs(id) - 1);
        }
        else {
            this.playerData.set(id, 'last_dig_time', Date.now());
        }
    
        await this.saveGame();
    
        return treasure;
    }    
}

module.exports = {
    TreasureHunt: TreasureHunt
}