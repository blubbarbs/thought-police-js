const jingleURL = 'https://storage.googleapis.com/discord_audio_jingles/MC%20Ballyhoo%20Laugh.mp3';

async function execute(interaction, args) {
    const voiceChannel = interaction.member.voice.channel;

    if (voiceChannel == null || voiceChannel == undefined) {
        await interaction.reply({ content: 'You are not connected to a voice channel.' , ephemeral: true });
    }
    else {
        await interaction.client.jingleHandler.playJingle(voiceChannel, jingleURL);
        await interaction.reply({ content: 'Done!', ephemeral: true });
    }
}

module.exports = {
    description: 'Plays the Ballyhoo jingle to the user connected in a voice chat.',
    execute: execute
}