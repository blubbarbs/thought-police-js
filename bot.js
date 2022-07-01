require('dotenv').config();

const path = require('node:path');
const { CommandHandler }  = require('./handlers/command_handler.js');
const { HashDataHandler, KeyedDataHandler } = require('./handlers/redis_data_handler.js');
const { JingleHandler } = require('./handlers/jingle_handler.js');
const { ScoreboardHandler } = require('./handlers/scoreboard_handler.js');
const { Client, Intents } = require('discord.js');
const { createClient } = require('redis');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });
const redis = createClient({ url: process.env.REDIS_URL });

client.redis = redis;
client.roleDataHandler = new HashDataHandler(redis, 'roleinfo.');
client.userDataHandler = new HashDataHandler(redis, 'userinfo.');
client.dataHandler = new KeyedDataHandler(redis);
client.commandHandler = new CommandHandler(client);
client.scoreboardHandler = new ScoreboardHandler(client);
client.jingleHandler = new JingleHandler();

client.on('ready', async () => {
    await redis.connect();
    
    client.redisHeartbeat = setInterval(async () => await redis.ping(), 60000);
    client.guild = await client.guilds.fetch('209496826204782592');
    client.announcementChannel = await client.guild.channels.fetch('794518074425475072');
    client.scoreboardChannel = await client.guild.channels.fetch('987990655601102899');
});

client.on('shardDisconnect', async () => {
    await client.redis.disconnect();
    clearInterval(client.redisHeartbeat);
}); 

client.commandHandler.reloadCommands(path.join(__dirname, 'commands'));
client.login(process.env.TOKEN);
