async function execute(interaction) {
    const target = interaction.member;
    let points = await client.userDataHandler.get(target.id, 'points');
    points = points == null ? 0 : +points;

    if (points == 0) {
        await interaction.reply({ content: 'You have no points.', ephemeral: true });
    }
    else if (points == 1) {
        await interaction.reply({ content: `You have 1 point.`, ephemeral: true });
    }
    else {
        await interaction.reply({ content: `You have ${points} points.`, ephemeral: true });
    }
}

module.exports = {
    description: 'Commands related to the points system on the Discord.',
}