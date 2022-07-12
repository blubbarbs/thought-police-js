async function execute(interaction, args) {
    const client = interaction.client;
}

module.exports = {
    description: 'Gives (or takes away) points from a specific member.',
    args: {
        reward: {
            type: 'string',
            description: 'The item you want to redeem. For a detailed description, see /points rewards.'
        }
    },
    execute: execute
}