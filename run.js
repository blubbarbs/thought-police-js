require('module-alias/register');
require('dotenv').config();
process.env.TZ = 'America/Los_Angeles';

const path = require('node:path');
const { client } = require('@bot');
const {
    MudaeHandler,
    CommandHandler,
    DataHandler,
    ScheduleHandler
} = require('@handlers');

async function start() {
    await CommandHandler.reloadCommands(path.join(__dirname, 'commands'));

    client.on('ready', onReady);
    client.on('shardDisconnect', onDisconnect);
    client.on('interactionCreate', onInteract);

    client.login(process.env.TOKEN);
}

async function onReady() {
    await MudaeHandler.updateCurfew();
    await DataHandler.redis.connect();
    await DataHandler.fetchAll();
    await ScheduleHandler.loadSchedulers();

    console.log('Loaded client.');
}

async function onDisconnect() {
    await DataHandler.redis.disconnect();
    await MudaeHandler.haltCurfew();
    await ScheduleHandler.unloadAll();
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

start()
.then(() => console.log('Logged into client...'))
.catch((error) => console.error(error));