const { Collection } = require('discord.js');
const { CommandArgument } = require('./command_arg');
const path = require('node:path');
const fs = require('node:fs');

class Command {
    constructor(commandPath, parent) {
        let commandObj = null;
        let hasSubcommands = false;

        if (commandPath.endsWith('.js')) {
            commandObj = require(commandPath);
        }
        else if (fs.existsSync(path.join(commandPath, '.js'))) {
            commandObj = require(path.join(commandPath, '.js'));
            hasSubcommands = true;
        }
        else {
            commandObj = {};
            hasSubcommands = true;
        }
        
        this.parent = parent;
        this.name = path.basename(commandPath, '.js');
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
                this.args.set(name, new CommandArgument(name, argObject));
            }
        }

        if (hasSubcommands) {
            for (const subcommandFileName of fs.readdirSync(commandPath).filter((name) => name.endsWith('.js') && name != '.js')) {
                const subcommand = new Command(path.join(commandPath, subcommandFileName), this);

                this.subcommands.set(subcommand.name, subcommand);
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

    async execute(interaction) {
        const processedArgs = {};

        for (const arg of this.args.values()) {
            processedArgs[arg.name] = await arg.process(interaction);
        }

        if (!interaction.member.permissions.has(this.permissions)) {
            throw 'You do not have permission to use this command.';
        }
        
        for (const check of this.checks) {
            await check(interaction, processedArgs);
        }
        
        await this.run(interaction, processedArgs);
    }
}

module.exports = {
    Command: Command
}