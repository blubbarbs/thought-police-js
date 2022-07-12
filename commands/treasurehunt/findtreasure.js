const { Permissions } = require('discord.js');
const { TreasureHunt } = require('../../game/treasure_hunt');
const { toAlphanumeric } = require('../../util/grid_coords');

async function execute(interaction, args) {
    treasureTiles = [];
    
    for (let y = 0; y < TreasureHunt.grid.width; y++) {
        for (let x = 0; x < TreasureHunt.grid.length; x++) {
            if (TreasureHunt.grid.get(x, y, 'treasure') != null) {
                treasureTiles.push(toAlphanumeric(x, y));
            }
        }
    }

    await interaction.reply({ content: `The treasure(s) are located at: ${treasureTiles.join(',')}`, ephemeral: true });
}

module.exports = {
    description: 'Find all the hidden treasure.',
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}