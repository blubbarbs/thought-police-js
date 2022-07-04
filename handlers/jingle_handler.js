const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const { request } = require('undici');

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

        const audioStreamReq = await request(jingleURL);
        const audioResource = createAudioResource(audioStreamReq.body);        

        this.audioPlayer.play(audioResource);
    }
}

module.exports = {
    JingleHandler: JingleHandler
}
