const { Permissions } = require('discord.js');
const { RoleHandler } = require('../../handlers/role_handler');

async function execute(interaction, args) {
    const role = args['role'];
    const description = args['description'];

    await RoleHandler.updateDescription(role.id, description);
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