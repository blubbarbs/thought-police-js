async function execute(interaction, args) {
    const voiceChannel = interaction.member.voice.channel;
    const jingleHandler = interaction.client.jingleHandler;
    const url = args['url'];
    const isValidURL = await jingleHandler.isAudioURL(url);

    if (!isValidURL) {
        await interaction.reply({ content: 'That is not a valid audio URL.', ephemeral: true });
    }
    else if (voiceChannel == null || voiceChannel == undefined) {
        await interaction.reply({ content: 'You are not connected to a voice channel.' , ephemeral: true });
    }
    else {
        await interaction.client.jingleHandler.playJingle(voiceChannel, url);
        await interaction.reply({ content: 'Done!', ephemeral: true });
    }
}

module.exports = {
    description: 'Plays a jingle to your currently connected voice chat.',
    args: {
        url: {
            type: 'string',
            description: 'URL directing to the .mp3 file to be played.',
            optional: false
        }
    },
    execute: execute
}