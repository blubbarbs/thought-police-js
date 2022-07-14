async function execute(interaction, args) {
    await interaction.reply({ content: 'This command is still under construction!', ephemeral: true });
}

module.exports = {
    description: 'Lists all the available rewards..',
    args: {
        reward: {
            type: 'string',
            description: 'The item you want to redeem. For a detailed description, see /points rewards.'
        }
    },
    execute: execute
}