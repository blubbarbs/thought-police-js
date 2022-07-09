require('dotenv').config();

const path = require('node:path');
const { CommandHandler, onInteract }  = require('./handlers/command_handler.js');
const { RedisHandler } = require('./redis/RedisHandler');
const { NamespaceRedisHandler } = require('./redis/NamespaceRedisHandler');
const { JingleHandler } = require('./handlers/jingle_handler.js');
const { PointsHandler } = require('./handlers/points_handler.js');
const { Client, Intents } = require('discord.js');
const { createClient } = require('redis');

const { TreasureHunt } = require('./games/treasure_hunt.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });
const redis = createClient({ url: process.env.REDIS_URL });

async function setupClientEvents() {
    client.on('ready', async () => {
        client.guild = await client.guilds.fetch('209496826204782592');
        client.announcementChannel = await client.guild.channels.fetch('794518074425475072');
        client.scoreboardChannel = await client.guild.channels.fetch('987990655601102899');
    
        await client.treasureHunt.loadGame();
    });
    
    client.on('shardDisconnect', async () => {
        await client.redis.disconnect();
        clearInterval(client.redisHeartbeat);
    }); 
    
    client.on('guildMemberRemove', async (member) => {
        const roles = Array.from(member.roles.cache.keys());
        const timesLeft = await client.userData.get(member.id, 'timesLeft');
    
        await client.userData.sets(member.id, { roles: roles, 'times_left': timesLeft + 1 });
    });
    
    client.on('guildMemberAdd', async (member) => {
        const previousRoles = client.userData.get(member.id, 'roles');
    
        if (previousRoles != null) {
            await member.roles.add(previousRoles);
        }
    });

    client.on('interactionCreate', onInteract);
}

async function setupClient() {
    await redis.connect();

    client.redis = redis;
    client.redisHeartbeat = setInterval(async () => await redis.ping(), 60000);
    
    client.roleData = new NamespaceRedisHandler(redis, 'role_info');
    client.userData = new NamespaceRedisHandler(redis, 'user_info');
    client.data = new RedisHandler(redis);

    client.commandHandler = new CommandHandler(client);
    client.pointsHandler = new PointsHandler(client);
    client.jingleHandler = new JingleHandler();
    
    client.treasureHunt = new TreasureHunt(client);

    await setupClientEvents();

    await client.commandHandler.reloadCommands(path.join(__dirname, 'commands'));
    client.login(process.env.TOKEN);
}

setupClient().then(() => console.log('Loaded client.')).catch((error) => console.error(error));