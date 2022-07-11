const { GridGame } = require("./util/game.js");

const COOLDOWN_TIMER_MINS = 1200;

const MIN_TREASURES = 1;
const MAX_TREASURES = 4;
const MIN_POINTS = 30;
const MAX_POINTS = 50;

const JACKPOT_PROBABILITY = .05;
const MIN_POINTS_JACKPOT = 75;
const MAX_POINTS_JACKPOT = 100;

async function isValidSpace(interaction, arg) {
    const treasureHunt = interaction.client.treasureHunt;
    const [x, y] = arg;

    if (x >= treasureHunt.grid.length || y >= treasureHunt.grid.width) {
        throw 'That space is outside the game area.';
    }
}

async function isFreeSpace(interaction, arg) {
    await isValidSpace(interaction, arg);

    const treasureHunt = interaction.client.treasureHunt;
    const [x, y] = arg;
    const isDug = treasureHunt.getTileData(x, y, 'is_dug');

    if (isDug) {
        throw 'That space has already been dug up.';
    }
}

async function canDig(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;

    if (treasureHunt.hasUsedDailyDig(interaction.member.id) && treasureHunt.getFreeDigs(interaction.member.id) == 0) {
        const minutesTillDailyDig = treasureHunt.getMinutesTillNextDig(interaction.member.id);
        const hours = Math.floor(minutesTillDailyDig / 60);
        const minutes = minutesTillDailyDig % 60;

        throw `You have already taken your daily dig and have no free digs left. Your next dig will be available in **${hours} hour(s)** and **${minutes} minutes**.`;
    }
}

class TreasureHuntGame extends GridGame {
    constructor (client) {
        super(client, 'treasure_hunt', 10, 10);
    }

    getMinutesTillNextDig(id) {
        const lastDigTime = this.getPlayerData(id, 'last_dig_time');

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
        return this.getPlayerData(id, 'free_digs') || 0;
    }

    hasUsedDailyDig(id) {
        return this.getMinutesTillNextDig(id) > 0;
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
            description: this.grid.toString()
        }

        return embed;
    }

    async newGame() {
        this.grid.clear();
        this.playerData.forEach((data) => data.set('last_dig_time', null));

        if (this.roll(JACKPOT_PROBABILITY)) {
            const [jackpotX, jackpotY] = this.randomTile();
            const jackpotAmount = this.randomInt(MAX_POINTS_JACKPOT, MIN_POINTS_JACKPOT);

            this.setTileData(jackpotX, jackpotY, 'treasure', jackpotAmount);
            this.setData('treasures_left', 1);
            this.setData('treasure', jackpotAmount);
            this.grid.defaultTileDisplay = '🟨';
        }
        else {
            const numTreasures = this.randomInt(MAX_TREASURES, MIN_TREASURES);
            const treasureTiles = numTreasures == 1 ? [this.randomTile(numTreasures)] : this.randomTile(numTreasures);
            const totalTreasureAmount = this.randomInt(MAX_POINTS, MIN_POINTS);
            let treasurePool = totalTreasureAmount;

            for (let i = 0; i < treasureTiles.length - 1; i++) {
                const [x, y] = treasureTiles[i];
                const treasureAmount = this.randomInt(Math.floor(treasurePool * .8), Math.ceil(treasurePool * .2));
                treasurePool -= treasureAmount;
                
                this.setTileData(x, y, 'treasure', treasureAmount);
            }
            
            const [finalX, finalY] = treasureTiles[treasureTiles.length - 1];
            
            this.setTileData(finalX, finalY, 'treasure', treasurePool);
            this.setData('treasure', totalTreasureAmount);
            this.setData('treasures_left', numTreasures);
        }
    }
    
    async dig(id, x, y) { 
        const treasure = this.getTileData(x, y, 'treasure');

        if (treasure != null) {
            this.setTileDisplay(x, y, '⭕');
            this.setData('treasure', this.getData('treasure') - treasure);
            this.setData('treasures_left', this.getData('treasures_left') - 1);
        }
        else {
            this.setTileDisplay(x, y, '❌');
        }

        this.setTileData(x, y, 'is_dug', true);

        if (this.hasUsedDailyDig(id)) {
            this.setPlayerData(id, 'free_digs', this.getFreeDigs(id) - 1);
        }
        else {
            this.setPlayerData(id, 'last_dig_time', Date.now());
        }

        await this.saveGame();
        
        return treasure;
    }
}

module.exports = {
    TreasureHunt: TreasureHuntGame,
    checks: {
        isValidSpace: isValidSpace,
        isFreeSpace: isFreeSpace,
        canDig: canDig
    }
}