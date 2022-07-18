const { Client, Intents } = require('discord.js');
const { createClient } = require('redis');
const { Database } = require('./data/redis/database.js');
const { TreasureHuntGame } = require('./games/treasure_hunt.js');

const GUILD_ID = '209496826204782592';

const redis = createClient({ url: process.env.REDIS_URL });
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });
const database = new Database(redis);

const TreasureHunt = new TreasureHuntGame(database);

async function getGuild() {
    const guild = await client.guilds.fetch(GUILD_ID);

    return guild;
}

module.exports = {
    client: client,
    database: database,
    TreasureHunt: TreasureHunt,
    getGuild: getGuild
}