async function execute(interaction, args) {
    const pointsHandler = interaction.client.pointsHandler;
    const target = args['target'] == null ? interaction.member : args['target'];
    const points = await pointsHandler.getPoints(interaction.member.id);

    if (points == 0) {
        if (target == interaction.member) {
            await interaction.reply({ content: 'You have no points.', ephemeral: true });
        }
        else {
            await interaction.reply({ content: `${target.displayName} has no points.`, ephemeral: true });
        }
    }
    else if (points == 1) {
        if (target == interaction.member) {
            await interaction.reply({ content: `You have 1 point.`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `${target.displayName} has 1 point.`, ephemeral: true });
        }
    }
    else {
        if (target == interaction.member) {
            await interaction.reply({ content: `You have ${points} points.`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `${target.displayName} has ${points} points.`, ephemeral: true });
        }
    }
}

module.exports = {
    description: 'Checks point count.',
    args: {
        target: {
            type: 'member',
            description: 'The person whose points you want to check.'
        }
    },
    execute: execute
}