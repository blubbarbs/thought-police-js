require('dotenv').config();

const path = require('node:path');

const { client, database } = require('./bot');
const { TreasureHunt } = require('./game/treasure_hunt');
const { onInteract, reloadCommands }  = require('./handlers/command_handler.js');
const { updateCurfew, haltCurfew } = require('./handlers/mudae_handler.js');

async function setupClientEvents() {
    client.on('ready', async () => {
        await TreasureHunt.loadGame();
        await updateCurfew();
    });
    
    client.on('shardDisconnect', async () => {
        await database.disconnect();
        await haltCurfew();
    }); 

    client.on('interactionCreate', onInteract);
}

async function setupClient() {
    await database.connect();         
    await setupClientEvents();
    await reloadCommands(path.join(__dirname, 'commands'));
    client.login(process.env.TOKEN);
}

process.env.TZ = 'America/Los_Angeles';

setupClient()
.then(() => console.log('Loaded client.'))
.catch((error) => console.error(error));

module.exports = {
    client: client,
    database: database
}