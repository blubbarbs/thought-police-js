const { createWriteStream, createReadStream, existsSync, mkdirSync } = require('node:fs');
const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } = require('@discordjs/voice');
const { stream } = require('undici');

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
        this.voiceChannel = null;
        this.currentConnection = null;

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => this.disconnect());        
    }

    disconnect() {
        this.audioPlayer.stop();
        this.currentConnection.destroy();

        this.voiceChannel = null;
        this.currentConnection = null;
    }

    connect(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.currentConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

        this.currentConnection.subscribe(this.audioPlayer);
    }

    async playJingle(voiceChannel, jingleURL) {        
        if (this.voiceChannel != null && this.voiceChannel != voiceChannel) {
            this.disconnect();
        }

        if (this.currentConnection == null) {
            this.connect(voiceChannel);
        }
        const audioStream = await getAudioStreamFromURL(jingleURL);
        const audioResource = createAudioResource(audioStream);        

        this.audioPlayer.play(audioResource);
    }
}

module.exports = {
    JingleHandler: JingleHandler
}
