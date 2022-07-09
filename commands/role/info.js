const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    const roleInfo = await client.roleData.get(role.id);

    if (Object.keys(roleInfo).length == 0) {
        await interaction.reply({ content: `There is no information available for this role.`, ephemeral: true });
    }
    else {
        const desc = roleInfo.description;
        await interaction.reply({ content: `\`${desc}\``, ephemeral: true });
    }
}

module.exports = {
    description: 'Displays role information for a specific role.',
    args: {
        role: {
            type: 'role',
            description: 'The role you want to find info on.',
            required: true
        }
    },
    execute: execute
}