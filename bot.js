const { Client, Intents } = require('discord.js');
const { createClient } = require('redis');
const { Redis1DStore, Redis2DStore } = require('./data/redis_store.js');
const { TreasureHuntGame } = require('./games/treasure_hunt.js');

const GUILD_ID = '209496826204782592';

const redis = createClient({ url: process.env.REDIS_URL });
const clientIntents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS
]
const client = new Client({ intents: clientIntents });

// Server Stores
const ServerSettings = new Redis1DStore(redis, 'server_settings');
const UserData = new Redis2DStore(redis, 'user_data');
const RoleData = new Redis2DStore(redis, 'role_data');

// Games
const TreasureHunt = new TreasureHuntGame(redis);

async function getGuild() {
    return client.guilds.fetch(GUILD_ID);
}

module.exports = {
    client: client,
    redis: redis,
    UserData: UserData,
    RoleData: RoleData,
    ServerSettings: ServerSettings,
    TreasureHunt: TreasureHunt,
    getGuild: getGuild
}