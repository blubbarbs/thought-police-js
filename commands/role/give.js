const { Permissions } = require('discord.js');
const { RoleHandler } = require('@handlers');
const ArgTypes = require('@command-arg-types');

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
            type: ArgTypes.ROLE,
            description: 'The role you want to give.',
            required: true
        },
        targets: {
            type: ArgTypes.MEMBER,
            num: '+',
            description: 'The members you want to give the role to.',
            required: true
        },
        reason: {
            type: ArgTypes.STRING,
            description: 'The reason the target(s) are getting this role.',
            required: true
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}