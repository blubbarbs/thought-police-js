const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
const { Command } = require('../command/command.js');

const restAPI = new REST({ version: '9' }).setToken(process.env.TOKEN);

async function onInteract(interaction) {
    if (!interaction.isCommand()) {
        return;
    }

    try {
        const command = interaction.client.commandHandler.findCommand(interaction.commandName, interaction.options._group, interaction.options._subcommand);

        await command.execute(interaction);  
    }
    catch (e) {
        if (typeof e == 'string') {
            await interaction.reply({ content: `${e}`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `There has been an error while executing this command.`, ephemeral: true });
            console.error(e);
        }
    }
}    

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
    }

    findCommand(commandName, subcommandGroup, subcommandName) {
        let command = this.commands.get(commandName);
        
        if (subcommandGroup != null) {
            command = command.subcommands.get(subcommandGroup);
        }

        if (subcommandName != null) {
            command = command.subcommands.get(subcommandName);
        }

        return command;
    }

    async reloadCommands(commandsPath) {
        const discordAPICommands = [];

        for (const commandFileName of fs.readdirSync(commandsPath)) {
            const commandPath = path.join(commandsPath, commandFileName);
            const command = Command.fromPath(commandPath);
            
            this.commands.set(command.name, command);
            discordAPICommands.push(command.toDiscordAPI());
        }

        const discordCommandsJSON = JSON.stringify(discordAPICommands);
        const discordCommandsJSONOld = await this.client.redis.get('commands');

        if (discordCommandsJSON != discordCommandsJSONOld) {    
            await restAPI.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: discordAPICommands })
            await this.client.redis.set('commands', discordCommandsJSON);
            
            console.log('Different command structure found. Succesfully updated commands.');
        }
        else {
            console.log('Command structure unchanged. All commands loaded.');
        }        
    }
}

module.exports = {
    CommandHandler: CommandHandler,
    onInteract: onInteract
}