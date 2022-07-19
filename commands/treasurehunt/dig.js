const { toAlphanumeric } = require('../../util/grid_coords'); 
const { PointsHandler } = require('../../handlers/points_handler');
const { TreasureHunt } = require('../../bot');

async function isValidSpace(_, arg) {
    const [x, y] = arg;

    if (x >= TreasureHunt.getWidth() || y >= TreasureHunt.getLength()) {
        throw 'That space is outside the game area.';
    }
}

async function isFreeSpace(_, arg) {
    await isValidSpace(_, arg);

    const [x, y] = arg;
    const isDug = TreasureHunt.getTileData('is_dug', x, y);

    if (isDug) {
        throw 'That space has already been dug up.';
    }
}

async function canDig(interaction) {
    if (!TreasureHunt.hasUsedDailyDig(interaction.member.id)) return;
    
    const minutesTillDailyDig = TreasureHunt.getMinutesTillNextDig(interaction.member.id);
    const hours = Math.floor(minutesTillDailyDig / 60);
    const minutes = minutesTillDailyDig % 60;

    throw `You have already taken your daily dig. Your next dig will be available in **${hours} hour(s)** and **${minutes} minute(s)**.`;
}

async function execute(interaction, args) {
    const [x, y] = args['coordinates'];
    const treasure = TreasureHunt.dig(interaction.member.id, x, y);

    if (treasure == null) {
        await TreasureHunt.saveGame();
        await interaction.reply({ content: `${interaction.member} dug at ${toAlphanumeric(x, y)}. They found nothing.`, embeds: [TreasureHunt.getBoardEmbed()] });
        return;
    }

    const points = treasure['points'];
    const freeDigs = treasure['free_digs'];
    const totalPointsLeft = TreasureHunt.getTreasuresLeft('points');
    let rewardMessage = `${interaction.member} dug at ${toAlphanumeric(x, y)}. *They struck treasure!* Inside was: \n\n`;

    if (points != null) {
        await PointsHandler.addPoints(interaction.member.id, points);
        rewardMessage += `**${points}** points \n`;
    }

    if (freeDigs != null) {
        TreasureHunt.addFreeDigs(interaction.member.id, freeDigs);
        rewardMessage += `**${freeDigs}** free dig(s) \n`;
    }

    await interaction.reply({ content: rewardMessage, embeds: [TreasureHunt.getBoardEmbed()]});

    if (totalPointsLeft == 0) {
        await TreasureHunt.newGame();

        await interaction.followUp({ content: 'That was all of the treasure on the board. A new game has begun.', embeds: [TreasureHunt.getBoardEmbed()] });
    }
    else {
        await TreasureHunt.saveGame();
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