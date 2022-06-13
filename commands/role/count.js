const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const target = args['target'] != null ? args['target'] : interaction.member;
    const roleCount = target.roles.cache.size - 1;

    if (target == interaction.member) {
        await interaction.reply({ content: `You have ${roleCount} roles.`, ephemeral: true });
    }
    else {
        await interaction.reply({ content: `${target.displayName} has ${roleCount} roles.`, ephemeral: true });
    }
}

module.exports = {
    description: 'Counts the amount of roles a user has.',
    args: {
        target: {
            type: 'member',
            description: 'User whose roles you want to see.'
        }
    },
    execute: execute
}