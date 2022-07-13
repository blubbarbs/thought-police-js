const { Permissions } = require('discord.js');
const { PointsHandler } = require('../../handlers/points_handler');

async function execute(interaction, args) {
    const points = args['points'];
    const first = args['first'];
    const second = args['second'];
    const third = args['third'];

    await interaction.deferReply({ ephemeral: true });

    for (const member of first) {
        await PointsHandler.addPoints(member.id, points, false);
    }

    for (const member of second) {
        await PointsHandler.addPoints(member.id, Math.round(points * .6), false);
    }

    for (const member of third) {
        await PointsHandler.addPoints(member.id, Math.round(points * .3), false);
    }

    await PointsHandler.updateLeaderboard();
    await interaction.editReply('Gave points to all listed members.');
}

module.exports = {
    description: 'Gives (or takes away) points from a specific member.',
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