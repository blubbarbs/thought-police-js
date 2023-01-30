const { Client, Intents } = require('discord.js');
const { DataHandler } = require('./handlers/data_handler.js');
const { TreasureHuntGame } = require('./games/treasure_hunt.js');

const GUILD_ID = '209496826204782592';

const clientIntents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS
]
const client = new Client({ intents: clientIntents });

// Server Stores
const ServerSettings = DataHandler.cache('server_settings');
const UserData = DataHandler.cache('user_data');
const RoleData = DataHandler.cache('role_data');

// Games
const TreasureHunt = new TreasureHuntGame();

async function getGuild() {
    return client.guilds.fetch(GUILD_ID);
}

module.exports = {
    client: client,
    UserData: UserData,
    RoleData: RoleData,
    ServerSettings: ServerSettings,
    TreasureHunt: TreasureHunt,
    getGuild: getGuild
}