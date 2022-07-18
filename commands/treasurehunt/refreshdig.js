const { Permissions } = require('discord.js');
const { TreasureHunt } = require('../../bot');

async function execute(interaction, args) {
    const target = args['target'] || interaction.member;

    TreasureHunt.setPlayerData('last_dig_time', target.id, null);
    await TreasureHunt.saveGame();
    
    if (target == interaction.member) {
        await interaction.reply({ content: `Successfully refreshed your dig cycle.`, ephemeral: true });
    }
    else {
        await interaction.reply({ content: `Successfully refreshed the dig cycle for ${target}.`, ephemeral: true });
    }
}

module.exports = {
    description: 'Refresh the dig cycle for someone.',
    args: {
        target: {
            type : 'member',
            description: 'Who to refresh the dig cycle for.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}