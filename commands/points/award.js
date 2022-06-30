const { Permissions } = require('discord.js');

async function awardPoints(client, member, deltaPoints) {
    let points = +(await client.userDataHandler.get(member.id, 'points'));
    points = points + deltaPoints;

    await client.userDataHandler.set(member.id, { points: points });
}

async function execute(interaction, args) {
    const client = interaction.client;
    const points = args['points'];
    const first = args['first'];
    const second = args['second'];
    const third = args['third'];

    await interaction.deferReply({ ephemeral: true });

    for (const member of first) {
        await awardPoints(client, member, points);
    }

    for (const member of second) {
        await awardPoints(client, member, Math.round(points * .6));
    }

    for (const member of third) {
        await awardPoints(client, member, Math.round(points * .3));
    }

    await interaction.editReply('Gave points to all listed members.');
    await client.scoreboardHandler.updateChannel();    
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