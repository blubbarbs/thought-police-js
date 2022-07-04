const { GridGame } = require("./util/gridgame.js");

async function isValidSpace(interaction, arg) {
    const treasureHunt = interaction.client.treasureHunt;
    const [x, y] = arg;

    if (x >= treasureHunt.gridgame.length || y >= treasureHunt.gridgame.width) {
        throw 'That space is outside the game area.';
    }
}

async function isFreeSpace(interaction, arg) {
    await isValidSpace(interaction, arg);

    const treasureHunt = interaction.client.treasureHunt;
    const [x, y] = arg;
    const tileData = treasureHunt.gridgame.getTileData(x, y);

    if (tileData?.isDug) {
        throw 'That space has already been dug up.';
    }
}

async function hasNotDug(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;
    const lastDigTime = treasureHunt.gridgame.getPlayerData(interaction.member.id)?.lastDigTime;

    if (lastDigTime != null) {
        const msDifference = Date.now() - lastDigTime;
        const minutesDifference = Math.floor(msDifference / 60000);

        if (minutesDifference < 1200) {
            const minutesTillRefresh = 1200 - minutesDifference;

            throw `You have already taken your daily dig. Your next dig will be available in ${(Math.floor(minutesTillRefresh / 60))} hours and ${minutesTillRefresh % 60} minutes.`;
        }
    }
}

class TreasureHuntGame {
    constructor (client) {
        this.client = client;
    }

    getBoardEmbed() {
        const gridString = this.gridgame.toString();
        
        const embed = {
            color: '#ebf2a0',
            title: 'Treasure Hunt!',
            fields: [
                {
                    name: 'Points in Treasure Chest',
                    value: '' + this.gridgame.data.treasureAmount,
                    inline: false
                }
            ],
            description: gridString
        }

        return embed;
    }

    async startNewGame() {
        this.gridgame = new GridGame(12, 12);

        const [treasureX, treasureY] = this.gridgame.randomTile();
        const treasureAmount = Math.ceil((Math.random() * 20) + 15);
        this.gridgame.getTileData(treasureX, treasureY).treasure = treasureAmount;
        this.gridgame.data.treasureAmount = treasureAmount;

        console.log(this.gridgame.grid);

        console.log(`Treasure X: ${treasureX}, Treasure Y: ${treasureY} Treasure: ${treasureAmount}`);

        await this.saveGame();
    }

    async loadGame() {
        const loadedGame = await this.client.dataHandler.get('treasure_hunt');

        if (loadedGame != null) {
            this.gridgame = GridGame.fromObject(loadedGame);
        
            await this.saveGame();
        }
        else {
            await this.startNewGame();
        }
    }
    
    async saveGame() {
        await this.client.dataHandler.set({ treasure_hunt: this.gridgame });
    }

    async dig(id, x, y) { 
        const tileData = this.gridgame.getTileData(x, y);

        this.gridgame.setTileData(x, y, { display: '✖', isDug: true });
        this.gridgame.getPlayerData(id).lastDigTime = Date.now();

        if ('treasure' in tileData) {
            const userDataHandler = this.client.userDataHandler;
            const scoreboardHandler = this.client.scoreboardHandler;
            const currentPoints = await userDataHandler.get(id, 'points');

            console.log(`Found ${currentPoints} ${tileData.treasure}`);

            await userDataHandler.set(id, { points: currentPoints + tileData.treasure });
            await scoreboardHandler.updateChannel();
            await this.startNewGame();
        }
        else {
            await this.saveGame();
        }
        
        return tileData?.treasure;
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