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
        points: {
            type: 'integer',
            description: 'New point amount.',
            required: true
        },
        target: {
            type: 'member',
            description: 'The person whose points you want to set.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}