const { checks } = require('../../games/treasure_hunt.js');

async function execute(interaction, args) {
    const [x, y] = args['coordinates'];
    const treasureHunt = interaction.client.treasureHunt;
    const result = await treasureHunt.dig(interaction.member.id, x, y);

    if (result != null) {
        await interaction.reply({ content: `CONGRATULATIONS!! You have found the treasure!! You have won ${result} points!`, ephemeral: true });
        await interaction.followUp(`${interaction.member} has found the treasure! They have gained ${result} points. A new game has started.`);
    }
    else {
        await interaction.reply({ content: 'No luck. Nothing was found at the spot you dug.', ephemeral: true });
    }    
}

module.exports = {
    description: 'Dig for daily treasure!',
    args: {
        coordinates: {
            type : 'grid_coordinates',
            description: 'Coordinates of where to dig.',
            optional: false,
            check: checks.isFreeSpace
        }
    },
    check: checks.hasNotDug,
    execute: execute
}