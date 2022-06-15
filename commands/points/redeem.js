async function execute(interaction, args) {
    const client = interaction.client;
    let points = await client.userDataHandler.get(interaction.member.id, 'points');
    points = points == null ? 0 : +points;

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