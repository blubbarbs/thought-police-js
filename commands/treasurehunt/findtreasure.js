const { Permissions } = require('discord.js');
const { TreasureHunt } = require('../../bot.js');
const { toAlphanumeric } = require('../../util/grid_coords.js');

async function execute(interaction, args) {
    treasureTiles = [];
    await interaction.reply({ content: `The treasure(s) are located at: ${treasureTiles.join(',')}`, ephemeral: true });
}

module.exports = {
    description: 'Find all the hidden treasure.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}