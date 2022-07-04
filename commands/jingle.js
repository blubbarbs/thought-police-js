const { request } = require('undici');

async function isMemberConnectedToVoice(interaction) {
    if (interaction.member.voice.channel == null) {
        throw 'You are not connected to a voice channel.'
    }
}

async function isAudioURL(interaction, arg) {
    let contentType = null;

    try {
        const audioStreamReq = await request({ origin: arg, method: 'HEAD' });
        contentType = audioStreamReq.headers?.['content-type'];
    }
    catch (e) {
        throw 'That is not a valid URL.';
    }
    
    if (!contentType.startsWith('audio') && contentType != 'application/ogg') {
        throw 'That URL does not point to a valid audio stream.';
    }
}

async function execute(interaction, args) {
    const voiceChannel = interaction.member.voice.channel;
    const url = args['url'];

    await interaction.client.jingleHandler.playJingle(voiceChannel, url);
    await interaction.reply({ content: 'Done!', ephemeral: true });
}

module.exports = {
    description: 'Plays a jingle to your currently connected voice chat.',
    args: {
        url: {
            type: 'string',
            description: 'URL directing to the .mp3 file to be played.',
            optional: false,
            check: isAudioURL
        }
    },
    check: isMemberConnectedToVoice,
    execute: execute
}