const { checks } = require('../../games/treasure_hunt.js');

async function execute(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;
    
    await interaction.reply({ embeds: [treasureHunt.getBoardEmbed()] });
}

module.exports = {
    description: 'Checks the board.',
    execute: execute
}