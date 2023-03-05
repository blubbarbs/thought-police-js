const { PointsHandler } = require("@handlers");

async function hasEnoughPoints(interaction, arg) {
    const price = PointsHandler.rewards[arg].price;
    const points = PointsHandler.points.get(interaction.member.id);

    if (points < price) {
        throw `You need ${price - points} more points to purchase this reward.`;
    }
}

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
            checks: [hasEnoughPoints]
        }
    },
    execute: execute
}