require('dotenv').config();

const CommandHandler  = require('./command_handler.js');
const { Client, Intents } = require('discord.js');
const { createClient } = require('redis');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const redis = createClient({ url: process.env.REDIS_URL });

CommandHandler.reloadCommands(client);

client.on('ready', async () => {
    await redis.connect();
    
    client.redis = redis;
    client.guild = await client.guilds.fetch('209496826204782592');
    client.announcementChannel = await client.guild.channels.fetch('794518074425475072');  
});

client.on('shardDisconnect', async () => {
    await client.redis.disconnect();
    console.log('Exited');
}); 

client.login(process.env.TOKEN);
