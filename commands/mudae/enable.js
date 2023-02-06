const { Permissions } = require('discord.js');
const { MudaeHandler } = require('@handlers');

async function execute(interaction) {
    await MudaeHandler.enableMudae(true);
    await interaction.reply( { content: `Successfully enabled the mudae channel.`, ephemeral: true });
}

module.exports = {
    description: 'Enables the mudae channel.',
    permissions: Permissions.FLAGS.MANAGE_CHANNELS,
    execute: execute
}