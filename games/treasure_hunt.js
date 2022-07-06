const { GridGame } = require("./util/game.js");

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
    const isDug = treasureHunt.getTileData(x, y, 'isDug');

    if (isDug) {
        throw 'That space has already been dug up.';
    }
}

async function hasNotDug(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;
    const lastDigTime = treasureHunt.getPlayerData(interaction.member.id, 'lastDigTime');

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
        super(client, 'treasure_hunt', 12, 12);
    }

    getBoardEmbed() {        
        const embed = {
            color: '#ebf2a0',
            title: 'Treasure Hunt!',
            fields: [
                {
                    name: 'Treasure',
                    value: `${this.getData('treasure')} points`,
                    inline: false
                }
            ],
            description: this.grid.toString()
        }

        return embed;
    }

    async newGame() {
        await super.newGame();

        const [treasureX, treasureY] = this.grid.randomTile();
        const treasure = Math.ceil((Math.random() * 20) + 15);
        
        this.setTileData(treasureX, treasureY, 'treasure', treasure);
        this.setData('treasure', treasure);
        this.setData('treasure_loc', `${treasureX}, ${treasureY}`);
    }
    
    async dig(id, x, y) { 
        const treasure = this.getTileData(x, y, 'treasure');

        this.setTileDisplay(x, y, '✖');
        this.setTileData(x, y, 'isDug', true);
        this.setPlayerData(id, 'lastDigTime', Date.now());

        if (treasure != null) {
            const userDataHandler = this.client.userDataHandler;
            const scoreboardHandler = this.client.scoreboardHandler;
            const currentPoints = await userDataHandler.get(id, 'points');

            await userDataHandler.set(id, 'points', currentPoints + treasure);
            await scoreboardHandler.updateChannel();
            await this.newGame();
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
        hasNotDug: hasNotDug
    }
}