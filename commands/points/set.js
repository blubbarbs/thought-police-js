const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const pointsHandler = interaction.client.pointsHandler;
    const target = args['target'] == null ? interaction.member : args['target'];
    const newPoints = args['points'];

    await pointsHandler.setPoints(target.id, newPoints);

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