const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    const roleDesc = await client.roleDataHandler.get(role.id, 'description');

    if (roleDesc == null) {
        await interaction.reply({ content: `There is no description available for this role.`, ephemeral: true });
    }
    else {
        await interaction.reply({ content: `\`${roleDesc}\``, ephemeral: true });
    }
}

module.exports = {
    description: 'Displays the description for a specific role.',
    args: {
        role: {
            type: 'role',
            description: 'The role you want to get the description of.',
            optional: false
        }
    },
    execute: execute
}