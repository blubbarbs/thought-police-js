const { Permissions } = require('discord.js');
const { MudaeHandler } = require('../../handlers/mudae_handler');

async function execute(interaction) {
    await MudaeHandler.enableMudae(false);
    await interaction.reply( { content: `Successfully disabled the mudae channel.`, ephemeral: true });
}

module.exports = {
    description: 'Disables the mudae channel.',
    permissions: Permissions.FLAGS.MANAGE_CHANNELS,
    execute: execute
}