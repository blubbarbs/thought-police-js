const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const { request } = require('undici');

class JingleHandler {
    static {
        this.audioPlayer = createAudioPlayer();
        this.currentConnection = null;
        this.currentVoiceChannel = null;
    }

    static disconnect() {
        this.audioPlayer.stop();
        this.currentConnection.destroy();

        this.voiceChannel = null;
        this.currentConnection = null;
    }

    static connect(voiceChannel) {
        this.currentVoiceChannel = voiceChannel;
        this.currentConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

        this.audioPlayer.once(AudioPlayerStatus.Idle, () => this.disconnect());
        this.currentConnection.subscribe(this.audioPlayer);
    }

    static async playJingle(voiceChannel, jingleURL) {
        if (this.currentVoiceChannel != null && this.currentVoiceChannel != voiceChannel) {
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
