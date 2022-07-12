const { Permissions } = require('discord.js');
const { database } = require('../bot');

async function execute(interaction, args) {
    const splitCommand = args['command'];
    
    try {
        const response = await database.redis.sendCommand(splitCommand);
        console.log(response);
        await interaction.reply({ content: `Output response to console.`, ephemeral: true });
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