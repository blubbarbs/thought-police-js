const { Collection } = require('discord.js');
const { CommandArgument } = require('./command_arg');
const { existsSync, readdirSync } = require('node:fs');
const path = require('node:path');

class Command {
    static fromPath(commandPath, parent) {
        let commandObj = null;
        let hasSubcommands = false;

        if (commandPath.endsWith('.js')) {
            commandObj = require(commandPath);
        }
        else if (existsSync(path.join(commandPath, '.js'))) {
            commandObj = require(path.join(commandPath, '.js'));
            hasSubcommands = true;
        }
        else {
            commandObj = {};
            hasSubcommands = true;
        }

        const commandName = path.basename(commandPath, '.js');
        const command = new Command(commandName, commandObj, parent);

        if (hasSubcommands) {
            for (const subcommandFileName of readdirSync(commandPath).filter((name) => name != '.js')) {
                const subcommand = Command.fromPath(path.join(commandPath, subcommandFileName), command);

                command.subcommands.set(subcommand.name, subcommand);
            }
        }

        return command;
    }

    constructor(name, commandObj, parent) {
        this.name = name;
        this.parent = parent;
        this.identifier = parent != null ? `${parent.identifier}.${this.name}` : this.name;
        this.description = commandObj.description || 'N/A';
        this.permissions = commandObj.permissions || [];
        this.checks = commandObj.checks == null ? [] : [commandObj.checks].flat();
        this.permitDM = commandObj.permitDM == true;
        this.args = new Collection();
        this.subcommands = new Collection();
        this.run = commandObj.execute;

        if ('args' in commandObj) {
            for (const [name, argObject] of Object.entries(commandObj.args)) {
                this.args.set(name, new CommandArgument(name, argObject, this));
            }
        }
    }
    
    toDiscordAPI() {
        const obj = {
            name: this.name,
            description: this.description,
            type: this.parent == null || this.subcommands.size == 0 ? 1 : 2,
            options: []
        };

        const optionsIterator = this.subcommands.size > 0 ? this.subcommands.values() : this.args.values();

        for (const option of optionsIterator) {
            obj.options.push(option.toDiscordAPI());
        }

        return obj;
    }

    toJSON() {
        return this.toDiscordAPI();
    }

    async execute(interaction) {
        const processedArgs = {};

        for (const arg of this.args.values()) {
            processedArgs[arg.name] = await arg.process(interaction);
        }

        let command = this;
        
        while (command != null) {
            if (!interaction.member.permissions.has(command.permissions)) {
                throw 'You do not have permission to use this command.';
            }
            
            for (const check of command.checks) {
                await check(interaction, processedArgs);
            }

            command = command.parent;
        }
        
        await this.run(interaction, processedArgs);
    }
}

module.exports = {
    Command: Command
}