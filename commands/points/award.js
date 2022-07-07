const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const pointsHandler = interaction.client.pointsHandler;
    const points = args['points'];
    const first = args['first'];
    const second = args['second'];
    const third = args['third'];

    await interaction.deferReply({ ephemeral: true });

    for (const member of first) {
        await pointsHandler.addPoints(member.id, points, false);
    }

    for (const member of second) {
        await pointsHandler.addPoints(member.id, Math.round(points * .6), false);
    }

    for (const member of third) {
        await pointsHandler.addPoints(member.id, Math.round(points * .3), false);
    }

    await pointsHandler.updateLeaderboard();
    await interaction.editReply('Gave points to all listed members.');
}

module.exports = {
    description: 'Gives (or takes away) points from a specific member.',
    args: {
        points: {
            type: 'integer',
            description: 'The amount of points 1st place gets. Point distribution is: 1st (100%), 2nd (60%), 3rd (30%).',
            optional: false
        },
        first: {
            type: 'member_list',
            description: 'The members who got 1st place.',
            optional: false
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