const { Permissions } = require('discord.js');
const { TreasureHunt } = require('../../../bot');

async function execute(interaction) {
    await TreasureHunt.saveGame();
    await interaction.reply({ content: `Successfully saved the game.`, ephemeral: true });
}

module.exports = {
    description: 'Save the game.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}