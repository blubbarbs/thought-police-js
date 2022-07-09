async function execute(interaction, args) {
    const pointsHandler = interaction.client.pointsHandler;
    let points = await pointsHandler.getPoints(interaction.member.id);

    await interaction.reply({ content: 'This feature is under construction!', ephemeral: true });
}

module.exports = {
    description: 'Gives (or takes away) points from a specific member.',
    args: {
        reward: {
            type: 'string',
            description: 'The item you want to redeem. For a detailed description, see /points rewards.',
            choices: ['test1', 'test2', 'test3']
        }
    },
    execute: execute
}