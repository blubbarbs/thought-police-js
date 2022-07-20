const { Permissions } = require('discord.js');
const { TreasureHunt } = require('../../../bot');

async function execute(interaction) {
    await TreasureHunt.loadGame();
    await interaction.reply({ content: `Successfully loaded the game.`, ephemeral: true });
}

module.exports = {
    description: 'Load the currently saved game.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}