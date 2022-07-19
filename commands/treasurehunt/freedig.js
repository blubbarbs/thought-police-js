const { TreasureHunt } = require('../../bot');
const { assert } = require('../../util/checks');

async function execute(interaction) {
    TreasureHunt.addFreeDigs(interaction.member.id, -1);
    TreasureHunt.clearPlayerData('last_dig_time', interaction.member.id);
    await TreasureHunt.saveGame();
    await interaction.reply({ content: 'Your dig cycle has been refreshed. You may dig again.', ephemeral: true });
}

module.exports = {
    description: 'Refresh the dig cycle.',
    checks: assert((interaction) => TreasureHunt.getFreeDigs(interaction.member.id) > 0, 'You have no free digs available.'),
    execute: execute
}