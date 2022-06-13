const { Permissions } = require('discord.js');
const hashStarter = 'roleinfo.';

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    const hash = hashStarter + role.id;
    
    for (const [key, value] of Object.entries(args)) {
        if (key != 'role' && value != null && value != undefined) {
            await client.redis.hSet(hash, key, value);
        }
    }

    await interaction.reply({ content: `Updated information for ${role.name}`, ephemeral: true });
}

module.exports = {
    description: 'Updates role information.',
    args: {
        role: {
            type: 'role',
            description: 'The role you want to update.',
            optional: false
        },
        description: {
            type: 'string',
            description: 'The new description of the role.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}