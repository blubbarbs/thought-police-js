require('dotenv').config();
process.env.TZ = 'America/Los_Angeles';

const path = require('node:path');
const { client, database } = require('./bot');
const { TreasureHunt } = require('./games/treasure_hunt');
const { MudaeHandler } = require('./handlers/mudae_handler');
const { CommandHandler } = require('./handlers/command_handler');

async function setupClientEvents() {
    client.on('ready', async () => {
        await TreasureHunt.loadGame();
        await MudaeHandler.updateCurfew();
    });
    
    client.on('shardDisconnect', async () => {
        await database.disconnect();
        await MudaeHandler.haltCurfew();
    }); 

    client.on('interactionCreate', CommandHandler.onInteract);
}

async function setupClient() {
    await database.connect();         
    await setupClientEvents();

    await CommandHandler.reloadCommands(path.join(__dirname, 'commands'));
    client.login(process.env.TOKEN);
}

setupClient()
.then(() => console.log('Loaded client.'))
.catch((error) => console.error(error));

module.exports = {
    client: client,
    database: database
}