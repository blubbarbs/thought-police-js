const { GridGame } = require("./util/game.js");

const minTreasures = 1;
const maxTreasures = 4;
const minPoints = 30;
const maxPoints = 50;

const jackpotProbability = .05;
const minPointsJackpot = 75;
const maxPointsJackpot = 100;

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

async function hasNotDug(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;
    const lastDigTime = treasureHunt.getPlayerData(interaction.member.id, 'last_dig_time');

    if (lastDigTime != null) {
        const msDifference = Date.now() - lastDigTime;
        const minutesDifference = Math.floor(msDifference / 60000);

        if (minutesDifference < 1200) {
            const minutesTillRefresh = 1200 - minutesDifference;

            throw `You have already taken your daily dig. Your next dig will be available in ${(Math.floor(minutesTillRefresh / 60))} hours and ${minutesTillRefresh % 60} minutes.`;
        }
    }
}

class TreasureHuntGame extends GridGame {
    constructor (client) {
        super(client, 'treasure_hunt', 10, 10);
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
        await super.newGame();

        if (this.roll(jackpotProbability)) {
            const [jackpotX, jackpotY] = this.randomTile();

            const jackpotAmount = this.randomInt(maxPointsJackpot, minPointsJackpot);

            this.setTileData(jackpotX, jackpotY, 'treasure', jackpotAmount);
            this.setData('treasures_left', 1);
            this.setData('treasure', jackpotAmount);
            this.grid.defaultTileDisplay = '🟨';
        }
        else {
            const numTreasures = this.randomInt(maxTreasures, minTreasures);
            const treasureTiles = numTreasures == 1 ? [this.randomTile(numTreasures)] : this.randomTile(numTreasures);
            const totalTreasureAmount = this.randomInt(maxPoints, minPoints);
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

        this.setPlayerData(id, 'last_dig_time', Date.now());
        this.setTileData(x, y, 'is_dug', true);

        await this.saveGame();
        
        return treasure;
    }
}

module.exports = {
    TreasureHunt: TreasureHuntGame,
    checks: {
        isValidSpace: isValidSpace,
        isFreeSpace: isFreeSpace,
        hasNotDug: hasNotDug
    }
}