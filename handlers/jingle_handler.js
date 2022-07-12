const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const { request } = require('undici');

const audioPlayer = createAudioPlayer();
let currentConnection = null;
let currentVoiceChannel = null;

function disconnect() {
    audioPlayer.stop();
    currentConnection.destroy();

    voiceChannel = null;
    currentConnection = null;
}

function connect(voiceChannel) {
    currentVoiceChannel = voiceChannel;
    currentConnection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    audioPlayer.once(AudioPlayerStatus.Idle, () => disconnect());       
    currentConnection.subscribe(audioPlayer);
}

async function playJingle(voiceChannel, jingleURL) {
    if (voiceChannel != null && currentVoiceChannel != voiceChannel) {
        disconnect();
    }

    if (currentConnection == null) {
        connect(voiceChannel);
    }

    const audioStreamReq = await request(jingleURL);
    const audioResource = createAudioResource(audioStreamReq.body);

    audioPlayer.play(audioResource);
}

module.exports = {
    connect: connect,
    disconnect: disconnect,
    playJingle: playJingle
}
