const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;

    await treasureHunt.newGame();
    await treasureHunt.saveGame();
    await interaction.reply({ content: `Successfully started a new game.`, ephemeral: true });
}

module.exports = {
    description: 'Start a new game for the treasure hunt.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}