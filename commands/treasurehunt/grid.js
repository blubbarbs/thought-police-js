const { TreasureHunt } = require("../../games/treasure_hunt.js");

async function execute(interaction, args) {
    await interaction.reply({ embeds: [TreasureHunt.getBoardEmbed()] });
}

module.exports = {
    description: 'Checks the board.',
    execute: execute
}