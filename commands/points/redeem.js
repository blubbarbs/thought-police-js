const { checks } = require("../../handlers/user_handler");

async function execute(interaction, args) {
    const reward = args['reward'];

    await interaction.reply({ content: `Chosen reward: ${reward}`, ephemeral: true });
}

module.exports = {
    description: 'Redeems a reward from the rewards shop.',
    args: {
        reward: {
            type: 'string',
            description: 'The item you want to redeem. For a detailed description, see /points rewards.',
            choices: {
                change_nickname: 'Nickname Change - 50 points',
                change_theme: 'Server Theme Change - 100 points',
                new_sticker: 'New Sticker - 400 points',
                voice_jingle: 'Voice Entrance Jingle - 500 points',
                custom_tag: 'Custom Tag - 1000 points'
            },
            required: true,
            checks: checks.hasEnoughPoints
        }
    },
    execute: execute
}