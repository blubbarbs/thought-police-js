const { request } = require('undici');
const { JingleHandler } = require('../handlers/jingle_handler');
const { assert } = require('../util/checks');

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

    await JingleHandler.playJingle(voiceChannel, url);
    await interaction.reply({ content: 'Done!', ephemeral: true });
}

module.exports = {
    description: 'Plays a jingle to your currently connected voice chat.',
    args: {
        url: {
            type: 'string',
            description: 'URL directing to the audio file to be played.',
            required: true,
            checks: isAudioURL
        }
    },
    checks: assert((interaction) => interaction.member.voice.channel != null, 'You are not connected to a voice channel.'),
    execute: execute
}