const { Permissions } = require('discord.js');
const { PointsHandler } = require('@handlers');
const ArgTypes = require('@command-arg-types');

async function execute(interaction, args) {
    const pointPrize = args['points'];
    const first = args['first'];
    const second = args['second'];
    const third = args['third'];

    await interaction.deferReply({ ephemeral: true });

    for (const member of first) {
        PointsHandler.points.add(member.id, pointPrize);
    }

    for (const member of second) {
        PointsHandler.points.add(member.id, Math.round(pointPrize * .6));
    }

    for (const member of third) {
        PointsHandler.points.add(member.id, Math.round(pointPrize * .3));
    }

    await PointsHandler.updateLeaderboard();
    await interaction.editReply('Gave points to all listed members.');
}

module.exports = {
    description: 'Awards points for winning a game',
    args: {
        points: {
            type: ArgTypes.INTEGER,
            description: 'The amount of points 1st place gets. Point distribution is: 1st (100%), 2nd (60%), 3rd (30%).',
            required: true
        },
        first: {
            type: ArgTypes.MEMBER,
            num: '+',
            description: 'The members who got 1st place.',
            required: true
        },
        second: {
            type: ArgTypes.MEMBER,
            num: '+',
            description: 'The members who got 2nd place.'
        },
        third: {
            type: ArgTypes.MEMBER,
            num: '+',
            description: 'The members who got 3rd place.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}