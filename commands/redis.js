const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const splitCommand = args['command'];
    const redis = client.redis;
    
    try {
        const response = await redis.sendCommand(splitCommand);
        await interaction.reply({ content: `${JSON.stringify(response, null, 2)}`, ephemeral: true });
    }
    catch (e) {
        console.error(e);
        await interaction.reply({ content: `ERROR: ${e}`, ephemeral: true });
    }
}

module.exports = {
    description: 'Executes a redis command.',
    args: {
        command: {
            type: 'string_list',
            description: 'Redis command to execute.',
            required: true
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute,
}