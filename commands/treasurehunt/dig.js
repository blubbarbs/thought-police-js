const { toAlphanumeric } = require('../../util/grid_coords'); 
const { TreasureHunt } = require('../../games/treasure_hunt.js');
const { PointsHandler } = require('../../handlers/points_handler');

async function isValidSpace(interaction, arg) {
    const [x, y] = arg;

    if (x >= TreasureHunt.grid.length || y >= TreasureHunt.grid.width) {
        throw 'That space is outside the game area.';
    }
}

async function isFreeSpace(interaction, arg) {
    await isValidSpace(interaction, arg);

    const [x, y] = arg;
    const isDug = TreasureHunt.grid.get(x, y, 'is_dug');

    if (isDug) {
        throw 'That space has already been dug up.';
    }
}

async function canDig(interaction, args) {
    if (TreasureHunt.hasUsedDailyDig(interaction.member.id) && TreasureHunt.getFreeDigs(interaction.member.id) == 0) {
        const minutesTillDailyDig = TreasureHunt.getMinutesTillNextDig(interaction.member.id);
        const hours = Math.floor(minutesTillDailyDig / 60);
        const minutes = minutesTillDailyDig % 60;

        throw `You have already taken your daily dig and have no free digs left. Your next dig will be available in **${hours} hour(s)** and **${minutes} minutes**.`;
    }
}

async function execute(interaction, args) {
    const [x, y] = args['coordinates'];
    const usedFreeDig = TreasureHunt.hasUsedDailyDig(interaction.member.id);
    const reward = await TreasureHunt.dig(interaction.member.id, x, y);

    if (reward != null) {
        const treasuresLeft = TreasureHunt.data.get('treasures_left');

        await PointsHandler.addPoints(interaction.member.id, reward);
        await interaction.reply({ content: `${interaction.member} has found ${reward} points at ${toAlphanumeric(x, y)}. Congrats!`, embeds: [TreasureHunt.getBoardEmbed()] });

        if (treasuresLeft == 0) {
            await TreasureHunt.newGame();
            await TreasureHunt.saveGame();

            await interaction.followUp({ content: 'That was all of the treasure on the board. Starting a new game...', embeds: [TreasureHunt.getBoardEmbed()] });
        }
    }
    else {
        await interaction.reply({ content: `${interaction.member} dug at ${toAlphanumeric(x, y)}. Nothing was found.`, embeds: [TreasureHunt.getBoardEmbed()] });
    }

    if (usedFreeDig) {
        await interaction.followUp({ content: `You have used up a free dig. You have ${TreasureHunt.getFreeDigs(interaction.member.id)} free digs remaining.`, ephemeral: true });
    }    
}

module.exports = {
    description: 'Dig for daily treasure!',
    args: {
        coordinates: {
            type : 'grid_coordinates',
            description: 'Coordinates of where to dig.',
            required: true,
            checks: isFreeSpace
        }
    },
    checks: canDig,
    execute: execute
}