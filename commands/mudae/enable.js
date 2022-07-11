const { Permissions } = require('discord.js');

async function execute(interaction) {
    const mudaeHandler = interaction.client.mudaeHandler;
    
    await mudaeHandler.enableMudae(true);
    await interaction.reply( { content: `Successfully enabled the mudae channel.`, ephemeral: true });
}

module.exports = {
    description: 'Enables the mudae channel.',
    permissions: Permissions.FLAGS.MANAGE_CHANNELS,
    execute: execute
}