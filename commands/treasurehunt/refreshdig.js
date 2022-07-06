const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const target = args['target'];
    const treasureHunt = interaction.client.treasureHunt;

    treasureHunt.setPlayerData(interaction.member.id, 'lastDigTime', null);
    await interaction.reply({ content: `Successfully refreshed the dig cycle for ${target}.`, ephemeral: true });
}

module.exports = {
    description: 'Refresh the dig cycle for someone.',
    args: {
        target: {
            type : 'member',
            description: 'Who to refresh the dig cycle for.',
            optional: false,
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}