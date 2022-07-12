const { Permissions } = require('discord.js');
const { TreasureHunt } = require('../../game/treasure_hunt');

async function execute(interaction, args) {
    await TreasureHunt.newGame();
    await TreasureHunt.saveGame();
    await interaction.reply({ content: `Successfully started a new game.`, ephemeral: true });
}

module.exports = {
    description: 'Start a new game for the treasure hunt.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}