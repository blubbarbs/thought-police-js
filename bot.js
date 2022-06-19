require('dotenv').config();

const path = require('node:path');
const { CommandHandler }  = require('./handlers/command_handler.js');
const { RedisDataHandler } = require('./handlers/redis_data_handler.js');
const { JingleHandler } = require('./handlers/jingle_handler.js');
const { PointsHandler } = require('./handlers/points_handler.js');
const { Client, Intents } = require('discord.js');
const { createClient } = require('redis');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });
const redis = createClient({ url: process.env.REDIS_URL });

client.roleDataHandler = new RedisDataHandler(redis, 'roleinfo.');
client.userDataHandler = new RedisDataHandler(redis, 'userinfo.');
client.commandHandler = new CommandHandler(client);
client.pointsHandler = new PointsHandler();
client.jingleHandler = new JingleHandler();
client.redis = redis;

client.on('ready', async () => {
    await redis.connect();
    
    client.redisHeartbeat = setInterval(async () => await redis.ping(), 60000);
    client.guild = await client.guilds.fetch('209496826204782592');
    client.announcementChannel = await client.guild.channels.fetch('794518074425475072');
    client.scoreboardChannel = await client.guild.channels.fetch();
});

client.on('shardDisconnect', async () => {
    await client.redis.disconnect();
    clearInterval(client.redisHeartbeat);
}); 

client.commandHandler.reloadCommands(path.join(__dirname, 'commands'));
client.login(process.env.TOKEN);
