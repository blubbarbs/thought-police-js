const { TreasureHunt } = require("../../game/treasure_hunt");

async function execute(interaction, args) {
    await interaction.reply({ embeds: [TreasureHunt.getBoardEmbed()] });
}

module.exports = {
    description: 'Checks the board.',
    execute: execute
}