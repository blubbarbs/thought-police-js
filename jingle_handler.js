const { createWriteStream, createReadStream, existsSync, mkdirSync } = require('node:fs');
const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } = require('@discordjs/voice');

async function getAudioStreamFromURL(url) {
    if (!existsSync('./jingles')){
        mkdirSync('./jingles');
    }
    
    await stream(url, () => createWriteStream('./jingles/jingle.mp3'));

    return createReadStream('./jingles/jingle.mp3');
}

class JingleHandler {
    constructor() {
        this.audioPlayer = createAudioPlayer();
        this.currentVoiceChannel = null;
        this.currentConnection = null;

        audioPlayer.on(AudioPlayerStatus.Idle, disconnect);        
    }

    disconnect() {
        audioPlayer.stop();
        currentConnection.destroy();

        currentConnection = null;
        currentVoiceChannel = null;
    }

    connect(voiceChannel) {
        currentConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
        currentVoiceChannel = voiceChannel;

        currentConnection.subscribe(audioPlayer);
    }

    async playJingle(voiceChannel, jingleURL) {        
        if (currentVoiceChannel != null && voiceChannel != currentVoiceChannel) {
            disconnect();
        }

        if (currentConnection == null) {
            connect(voiceChannel);
        }
        const audioStream = await getAudioStreamFromURL(jingleURL);
        const audioResource = createAudioResource(audioStream);        

        audioPlayer.play(audioResource);
    }
}

module.exports = {
    JingleHandler: JingleHandler
}
