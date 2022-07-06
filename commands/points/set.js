const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const target = args['target'] == null ? interaction.member : args['target'];
    const newPoints = args['points'];

    await client.userDataHandler.set(target.id, 'points', newPoints);
    await client.scoreboardHandler.updateChannel();

    if (target == interaction.member) {
        await interaction.reply({ content: `Set your points to ${newPoints}.`, ephemeral: true });
    }
    else {
        await interaction.reply({ content: `Set ${target.displayName}'s points to ${newPoints}.`, ephemeral: true });
    }

}

module.exports = {
    description: 'Sets points of a specific member.',
    args: {
        target: {
            type: 'member',
            description: 'The person whose points you want to set.'
        },
        points: {
            type: 'integer',
            description: 'New point amount.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}