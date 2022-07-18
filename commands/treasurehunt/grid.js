const { TreasureHunt } = require("../../bot");

async function execute(interaction, args) {
    await interaction.reply({ embeds: [TreasureHunt.getBoardEmbed()] });
}

module.exports = {
    description: 'Checks the board.',
    execute: execute
}