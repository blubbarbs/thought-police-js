const { TreasureHunt } = require("@games");

async function execute(interaction) {
    await interaction.reply({ embeds: [TreasureHunt.getBoardEmbed()] });
}

module.exports = {
    description: 'Checks the board.',
    execute: execute
}