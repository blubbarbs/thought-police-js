const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const target = args['target'] == null ? interaction.member : args['target'];
    const deltaPoints = args['points'];
    let points = +(await client.userDataHandler.get(target.id, 'points'));
    points = points + deltaPoints;

    await client.userDataHandler.set(target.id, 'points', points);
    await client.scoreboardHandler.updateChannel();    

    if (deltaPoints < 0) {
        if (target == interaction.member) {
            await interaction.reply({ content: `Took away ${deltaPoints} points. You now have ${points} points.`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `Took away ${deltaPoints} points from ${target.displayName}. They now have ${points} points.`, ephemeral: true });
        }
    }
    else if (deltaPoints == 0) {
        if (target == interaction.member) {
            await interaction.reply({ content: `You have given yourself no points. You still have ${points} points. Why would you even do this?`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `Gave no points to ${target.displayName}. They still have ${points} points. What an absolute waste of time.`, ephemeral: true });
        }
    }
    else {
        if (target == interaction.member) {
            await interaction.reply({ content: `Gave yourself ${deltaPoints} points. You now have ${points} points.`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `Gave ${deltaPoints} points to ${target.displayName}. They now have ${points} points.`, ephemeral: true });
        }
    }
}

module.exports = {
    description: 'Gives (or takes away) points from a specific member.',
    args: {
        target: {
            type: 'member',
            description: 'The person whose points you want to add/subtract.'
        },
        points: {
            type: 'int',
            description: 'How many points you want to add (or take away).'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}