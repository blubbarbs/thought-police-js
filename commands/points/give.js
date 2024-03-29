const { Permissions } = require('discord.js');
const { PointsHandler } = require('@handlers');
const ArgTypes = require('@command-arg-types');

async function execute(interaction, args) {
    const target = args['target'] || interaction.member;
    const deltaPoints = args['points'];
    const points = await PointsHandler.addPoints(target.id, deltaPoints);

    if (deltaPoints < 0) {
        if (target == interaction.member) {
            await interaction.reply({ content: `Took away ${-deltaPoints} point(s). You now have ${points} point(s).`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `Took away ${-deltaPoints} point(s) from ${target.displayName}. They now have ${points} point(s).`, ephemeral: true });
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
            await interaction.reply({ content: `Gave yourself ${deltaPoints} point(s). You now have ${points} point(s).`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `Gave ${deltaPoints} point(s) to ${target.displayName}. They now have ${points} point(s).`, ephemeral: true });
        }
    }
}

module.exports = {
    description: 'Gives (or takes away) points from a specific member.',
    args: {
        points: {
            type: ArgTypes.INTEGER,
            description: 'How many points you want to add (or take away).',
            required: true
        },
        target: {
            type: ArgTypes.MEMBER,
            description: 'The person whose points you want to add/subtract.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}