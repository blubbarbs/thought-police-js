const { Client, Intents } = require('discord.js');
const { createClient } = require('redis');
const { Data } = require('./data/local_data.js');
const { Database } = require('./data/redis/database.js');
const { RemoteData } = require('./data/remote_data.js');
const { TreasureHuntGame } = require('./games/treasure_hunt.js');

const GUILD_ID = '209496826204782592';

let guild = null;
const redis = createClient({ url: process.env.REDIS_URL });
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });
const database = new Database(redis);
const data = new Data(database);
const remoteData = new RemoteData(database);

const TreasureHunt = new TreasureHuntGame(data);

async function getGuild() {
    if (guild == null) {
        guild = await client.guilds.fetch(GUILD_ID);
    }
    
    return guild;
}

module.exports = {
    client: client,
    database: database,
    data: data,
    remoteData: remoteData,
    TreasureHunt: TreasureHunt,
    getGuild: getGuild
}