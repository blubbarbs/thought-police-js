const { Permissions } = require('discord.js');
const { enableMudae } = require('../../handlers/mudae_handler');

async function execute(interaction) {
    await enableMudae(true);
    await interaction.reply( { content: `Successfully enabled the mudae channel.`, ephemeral: true });
}

module.exports = {
    description: 'Enables the mudae channel.',
    permissions: Permissions.FLAGS.MANAGE_CHANNELS,
    execute: execute
}