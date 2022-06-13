const { Permissions } = require('discord.js');
const hashStarter = 'roleinfo.';

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    const roleInfo = await client.redis.hGetAll(hashStarter + role.id);

    if (roleInfo == undefined) {
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
            optional: false
        }
    },
    execute: execute
}