const { createWriteStream } = require('node:fs');
const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } = require('@discordjs/voice');
const { stream } = require('undici');


const jingleURL = 'https://storage.googleapis.com/discord_audio_jingles/MC%20Ballyhoo%20Laugh.mp3';

async function getVoiceStreamFromURL(url) {
    const voiceStream = await stream(url, () => createWriteStream('jingle.mp3'));

    return voiceStream;
}

async function execute(interaction, args) {
    const voiceChannel = interaction.member.voice.channel;
    if (voiceChannel == null || interaction.member.voice.channel == undefined) {
        await interaction.reply({ content: 'You are not connected to a voice channel.' , ephemeral: true});
    }
    else {
        const voiceStream = await getVoiceStreamFromURL(jingleURL);
        const audioResource = createAudioResource(voiceStream);
        const connection = joinVoiceChannel(voiceChannel);
        const audioPlayer = createAudioPlayer();

        connection.subscribe(audioPlayer);
        audioPlayer.play(audioResource);

        player.on(AudioPlayerStatus.Idle, () => {
            audioPlayer.stop();
            connection.destroy();
        });
    }
}

module.exports = {
    description: 'Plays the Ballyhoo jingle to the user connected in a voice chat.',
    execute: execute
}