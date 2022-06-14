const { createWriteStream, createReadStream, mkdirSync } = require('node:fs');
const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } = require('@discordjs/voice');
const { stream } = require('undici');

const jingleURL = 'https://storage.googleapis.com/discord_audio_jingles/MC%20Ballyhoo%20Laugh.mp3';

async function getVoiceStreamFromURL(url) {
    if (!fs.existsSync('./jingles')){
        fs.mkdirSync('./jingles');
    }
    await stream(url, () => createWriteStream('./jingles/jingle.mp3'));

    return createReadStream('./jingles/jingle.mp3');
}

async function execute(interaction, args) {
    const voiceChannel = interaction.member.voice.channel;

    if (voiceChannel == null || voiceChannel == undefined) {
        await interaction.reply({ content: 'You are not connected to a voice channel.' , ephemeral: true});
    }
    else {
        await interaction.reply({ content: 'Done!', ephemeral: true });
        const voiceStream = await getVoiceStreamFromURL(jingleURL);
        const audioResource = createAudioResource(voiceStream);
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
        const audioPlayer = createAudioPlayer();

        connection.subscribe(audioPlayer);
        audioPlayer.play(audioResource);

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            audioPlayer.stop();
            connection.destroy();
        });
    }
}

module.exports = {
    description: 'Plays the Ballyhoo jingle to the user connected in a voice chat.',
    execute: execute
}