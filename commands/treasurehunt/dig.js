const { checks } = require('../../games/treasure_hunt.js');
const { toAlphanumeric } = require('../../games/util/grid'); 

async function execute(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;
    const [x, y] = args['coordinates'];
    const reward = await treasureHunt.dig(interaction.member.id, x, y);

    if (reward != null) {
        const treasuresLeft = treasureHunt.getData('treasures_left');
        const pointsHandler = interaction.client.pointsHandler;

        await pointsHandler.addPoints(interaction.member.id, reward);
        await interaction.reply({ content: `${interaction.member} has found ${reward} points at ${toAlphanumeric(x, y)}. Congrats!` });

        if (treasuresLeft == 0) {
            await treasureHunt.newGame();
            await treasureHunt.saveGame();

            await interaction.followUp({ content: 'That was all of the treasure on the board. Starting a new game...' });
        }
    }
    else {
        await interaction.reply({ content: `${interaction.member} dug at ${toAlphanumeric(x, y)}. Nothing was found.` });
    }
}

module.exports = {
    description: 'Dig for daily treasure!',
    args: {
        coordinates: {
            type : 'grid_coordinates',
            description: 'Coordinates of where to dig.',
            required: true,
            checks: checks.isFreeSpace
        }
    },
    checks: checks.hasNotDug,
    execute: execute
}