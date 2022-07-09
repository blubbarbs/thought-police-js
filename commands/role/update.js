const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    
    delete args['role'];

    await client.roleData.sets(role.id, args);

    await interaction.reply({ content: `Updated information for ${role.name}`, ephemeral: true });
}

module.exports = {
    description: 'Updates role information.',
    args: {
        role: {
            type: 'role',
            description: 'The role you want to update.',
            required: true
        },
        description: {
            type: 'string',
            description: 'The new description of the role.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}