const { Client, Intents } = require('discord.js');

const GUILD_ID = '209496826204782592';

const clientIntents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS
]
const client = new Client({ intents: clientIntents });

async function getGuild() {
    return client.guilds.fetch(GUILD_ID);
}

module.exports = {
    client: client,
    getGuild: getGuild
}