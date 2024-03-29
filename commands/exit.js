const { Permissions } = require('discord.js');

async function execute(interaction) {
    await interaction.reply({ content: 'Goodbye!', ephemeral: true });

    interaction.client.destroy();
}

module.exports = {
    description: 'Exits the bot.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute,
}