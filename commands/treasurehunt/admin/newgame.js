const { Permissions } = require('discord.js');
const { TreasureHunt } = require('../../../bot');

async function execute(interaction) {
    await TreasureHunt.newGame();
    await interaction.reply({ content: `Successfully started a new game.`, ephemeral: true });
}

module.exports = {
    description: 'Start a new game.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}