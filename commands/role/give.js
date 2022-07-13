const { Permissions } = require('discord.js');
const { RoleHandler } = require('../../handlers/role_handler');

async function execute(interaction, args) {
    const role = args['role'];
    const targets = args['target'];
    const reason = args['reason'];

    await RoleHandler.awardRole(role, reason, targets);

    await interaction.reply({ content: `All roles have been awarded.`, ephemeral: true });
}

module.exports = {
    description: 'Gives a specific role to someone.',
    args: {
        role: {
            type: 'role',
            description: 'The role you want to give.',
            required: true
        },
        targets: {
            type: 'member_list',
            description: 'The members you want to give the role to.',
            required: true
        },
        reason: {
            type: 'string',
            description: 'The reason the target(s) are getting this role.',
            required: true
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}