const { Permissions } = require('discord.js');
const { setPoints } = require('../../handlers/user_handler.js');

async function execute(interaction, args) {
    const target = args['target'] || interaction.member;
    const newPoints = args['points'];

    await setPoints(interaction.member.id, newPoints);

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