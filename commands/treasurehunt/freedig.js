const { TreasureHunt } = require('@games');
const { assert } = require('@util/checks');

async function execute(interaction) {
    TreasureHunt.addFreeDigs(interaction.member.id, -1);
    TreasureHunt.playerData.child('last_dig_time').delete(interaction.member.id);

    await interaction.reply({ content: 'Your dig cycle has been refreshed. You may dig again.', ephemeral: true });
}

module.exports = {
    description: 'Refresh the dig cycle.',
    checks: [assert((interaction) => TreasureHunt.getFreeDigs(interaction.member.id) > 0, 'You have no free digs available.')],
    execute: execute
}