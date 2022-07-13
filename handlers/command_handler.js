const fs = require('node:fs');
const path = require('node:path');
const { client, database } = require('../bot.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
const { Command } = require('../command/command.js');

const restAPI = new REST({ version: '9' }).setToken(process.env.TOKEN);

class CommandHandler {
    static async onInteract(interaction) {
        if (!interaction.isCommand()) {
            return;
        }

        try {
            const command = CommandHandler.findCommand(interaction.commandName, interaction.options._group, interaction.options._subcommand);
            
            await command.execute(interaction);
        }
        catch (e) {
            if (typeof e == 'string') {
                await interaction.reply({ content: `\`\`\`${e}\`\`\``, ephemeral: true });
            }
            else {
                await interaction.reply({ content: '```There has been an unexpected error while executing this command.```', ephemeral: true });
                console.error(e);
            }
        }
    }
    
    static findCommand(commandName, subcommandGroup, subcommandName) {
        let command = client.commands.get(commandName);
    
        if (subcommandGroup != null) {
            command = command.subcommands.get(subcommandGroup);
        }
    
        if (subcommandName != null) {
            command = command.subcommands.get(subcommandName);
        }
    
        return command;
    }
    
    static async reloadCommands(commandsPath) {
        const commands = new Collection();
        const discordAPICommands = [];
    
        for (const commandFileName of fs.readdirSync(commandsPath)) {
            const commandPath = path.join(commandsPath, commandFileName);
            const command = Command.fromPath(commandPath);
    
            commands.set(command.name, command);
            discordAPICommands.push(command.toDiscordAPI());
        }
    
        const discordCommandsJSON = JSON.stringify(discordAPICommands);
        const discordCommandsJSONOld = await database.redis.get('commands');
    
        if (discordCommandsJSON != discordCommandsJSONOld) {
            await restAPI.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: discordAPICommands })
            await database.redis.set('commands', discordCommandsJSON);
    
            console.log('Different command structure found. Succesfully updated commands.');
        }
        else {
            console.log('Command structure unchanged. All commands loaded.');
        }
        client.commands = commands;
    }    
}

module.exports = {
    CommandHandler: CommandHandler
}