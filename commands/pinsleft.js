async function execute(interaction, args) {
    const channel = interaction.channel;
    const pinnedMessages = await interaction.channel.messages.fetchPinned();
    const pinCount = pinnedMessages.size;

    await interaction.reply({ content: `The amount of pins left for this channel is: ${50 - pinCount}`, ephemeral: true});
}

module.exports = {
    description: 'Lists the amount of pins left for the current channel.',
    execute: execute
}