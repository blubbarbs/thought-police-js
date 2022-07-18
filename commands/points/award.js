const { Permissions } = require('discord.js');
const { PointsHandler } = require('../../handlers/points_handler');

async function execute(interaction, args) {
    const pointPrize = args['points'];
    const first = args['first'];
    const second = args['second'];
    const third = args['third'];
    const allDeltaPoints = {};

    await interaction.deferReply({ ephemeral: true });

    for (const member of first) {
        allDeltaPoints[member.id] = pointPrize;
    }

    for (const member of second) {
        allDeltaPoints[member.id] = Math.round(pointPrize * .6);
    }

    for (const member of third) {
        allDeltaPoints[member.id] = Math.round(pointPrize * .3);
    }

    await PointsHandler.data.adds(allDeltaPoints);
    await PointsHandler.updateLeaderboard();
    await interaction.editReply('Gave points to all listed members.');
}

module.exports = {
    description: 'Awards points for winning a game',
    args: {
        points: {
            type: 'integer',
            description: 'The amount of points 1st place gets. Point distribution is: 1st (100%), 2nd (60%), 3rd (30%).',
            required: true
        },
        first: {
            type: 'member_list',
            description: 'The members who got 1st place.',
            required: true
        },
        second: {
            type: 'member_list',
            description: 'The members who got 2nd place.'
        },
        third: {
            type: 'member_list',
            description: 'The members who got 3rd place.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}