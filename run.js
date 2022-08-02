require('dotenv').config();
process.env.TZ = 'America/Los_Angeles';

const path = require('node:path');
const { client, database, TreasureHunt} = require('./bot');
const { MudaeHandler } = require('./handlers/mudae_handler');
const { CommandHandler } = require('./handlers/command_handler');

async function onReady() {
    await MudaeHandler.updateCurfew();

    console.log('Loaded client.')
}

async function onDisconnect() {
    await database.disconnect();
    await MudaeHandler.haltCurfew();
}

async function onInteract(interaction) {
    if (!interaction.isCommand()) return;

    try {
        const command = CommandHandler.findCommand(interaction.commandName, interaction.options._group, interaction.options._subcommand);
        
        await command.execute(interaction);
    }
    catch (e) {
        let errorMessage;

        if (typeof e == 'string') {
            errorMessage = `${e}`;
        }
        else {
            errorMessage = `There has been an unexpected error while executing this command.`;
            console.error(e);
        }

        if (interaction.deferred) {
            await interaction.editReply(errorMessage);
        }
        else if (interaction.replied) {
            await interaction.deleteReply();
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
        else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
}

async function onMemberJoin(member) {

}

async function onMemberLeave(member) {
    
}

async function start() {
    await database.connect();
    await CommandHandler.reloadCommands(path.join(__dirname, 'commands'));
    await TreasureHunt.loadGame();

    client.on('ready', onReady);
    client.on('shardDisconnect', onDisconnect); 
    client.on('interactionCreate', onInteract);
    
    client.login(process.env.TOKEN);
}

start()
.then(() => console.log('Logged into client...'))
.catch((error) => console.error(error));

module.exports = {
    client: client,
    database: database
}