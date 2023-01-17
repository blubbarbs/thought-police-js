const fs = require('node:fs');
const path = require('node:path');
const { client } = require('../bot.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
const { Command } = require('../command/command.js');

const restAPI = new REST({ version: '9' }).setToken(process.env.TOKEN);

class CommandHandler {
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
        client.commands = new Collection();

        for (const commandFileName of fs.readdirSync(commandsPath)) {
            const commandPath = path.join(commandsPath, commandFileName);
            const command = Command.fromPath(commandPath);

            client.commands.set(command.name, command);
        }

        await restAPI.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: discordAPICommands });
        console.log('All commands loaded.');
    }
}

module.exports = {
    CommandHandler: CommandHandler
}