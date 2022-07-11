const { Permissions } = require('discord.js');

async function execute(interaction) {
    const mudaeHandler = interaction.client.mudaeHandler;
    
    await mudaeHandler.enableMudae(false);
    await interaction.reply( { content: `Successfully disabled the mudae channel.`, ephemeral: true });
}

module.exports = {
    description: 'Disables the mudae channel.',
    permissions: Permissions.FLAGS.MANAGE_CHANNELS,
    execute: execute
}