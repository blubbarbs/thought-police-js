const { toCoordinates } = require('@util/grid_coords');
const { PointsHandler } = require('@handlers');
const { TreasureHunt } = require('@games');

async function isValidSpace(_, tileID) {
    const [x, y] = toCoordinates(tileID);

    if (x >= TreasureHunt.length || y >= TreasureHunt.width) {
        throw 'That space is outside the game area.';
    }
}

async function isFreeSpace(_, tileID) {
    await isValidSpace(_, tileID);

    if (TreasureHunt.isTileDug(tileID)) {
        throw 'That space has already been dug up.';
    }
}

async function canDig(interaction) {
    if (TreasureHunt.hasDailyDig(interaction.member.id)) return;

    const minutesTillDailyDig = TreasureHunt.getMinutesTillNextDig(interaction.member.id);
    const hours = Math.floor(minutesTillDailyDig / 60);
    const minutes = minutesTillDailyDig % 60;

    throw `You have already taken your daily dig. Your next dig will be available in **${hours} hour(s)** and **${minutes} minute(s)**.`;
}

async function execute(interaction, args) {
    const tileID = args['coordinates'];
    const treasure = TreasureHunt.dig(interaction.member.id, tileID);

    if (!treasure) {
        await interaction.reply({ content: `${interaction.member} dug at ${tileID}. They found nothing.`, embeds: [TreasureHunt.getBoardEmbed()] });
        return;
    }

    const points = treasure['points'];
    const freeDigs = treasure['free_digs'];
    const totalPointsLeft = TreasureHunt.getTreasuresLeft('points');
    let rewardMessage = `${interaction.member} dug at ${tileID}. *They struck treasure!* Inside was: \n\n`;

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
        TreasureHunt.newGame();

        await interaction.followUp({ content: 'That was all of the treasure on the board. A new game has begun.', embeds: [TreasureHunt.getBoardEmbed()] });
    }
}

module.exports = {
    description: 'Dig for daily treasure!',
    args: {
        coordinates: {
            type : 'grid_coordinates',
            description: 'Coordinates of where to dig.',
            required: true,
            checks: [isFreeSpace]
        }
    },
    checks: [canDig],
    execute: execute
}