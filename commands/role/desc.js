const { RoleHandler } = require("../../handlers/role_handler");

async function execute(interaction, args) {
    const role = args['role'];
    const roleDesc = await RoleHandler.getDescription(role.id);

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
            required: true
        }
    },
    execute: execute
}