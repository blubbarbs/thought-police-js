const fs = require('node:fs');
const path = require('node:path');
const processors = require('./command_arg_processors.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');

const restAPI = new REST({ version: '9' }).setToken(process.env.TOKEN);

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

class CommandArgument {
    constructor(name, argObject) {
        this.name = name;
        this.type = argObject.type || 'string';
        this.description = argObject.description || 'N/A';
        this.permissions = argObject.permissions || [];
        this.checks = argObject.checks == null ? [] : [argObject.checks].flat();
        this.required = argObject.required == true;
        this.choices = [];

        if ('choices' in argObject) {
            if (Array.isArray(argObject.choices)) {
                for (const choice of argObject.choices) {
                    this.choices.push({ name: choice, value: choice });
                }
            }
            else {
                for (const [value, name] of Object.entries(argObject.choices)) {
                    choiceList.push({ name: name, value: value });
                }
            }
        }
    }

    isDefaultType() {
        switch(this.type) {
            case 'user':
            case 'member':
            case 'role':
            case 'channel':
            case 'mentionable':
            case 'integer':
            case 'number':
            case 'string':
            case 'boolean':
            case 'attachment':
                return true;
            default:
                return false;
        }
    }

    getDiscordAPIType() {
        switch(this.type) {
            case 'string':
                return 3;
            case 'integer':
                return 4;
            case 'boolean':
                return 5;
            case 'user':
            case 'member':
                return 6;
            case 'channel':
                return 7;
            case 'role':
                return 8;
            case 'mentionable':
                return 9;
            case 'number':
                return 10;
            case 'attachment':
                return 11;
            default:
                return 3;
        }
    }

    toDiscordAPI() {
        const obj = {
            name: this.name,
            description: this.description,
            type: this.getDiscordAPIType(),
            required: this.required,
            choices: this.choices
        };

        return obj;
    }

    async process(interaction) {
        const processor = processors[this.type] || processors['string'];
        const processedArgument = await processor(interaction, this.name);

        if (!interaction.member.permissions.has(this.permissions)) {
            throw `You do not have the permission to use the "${this.name}" argument.`;
        }

        for (const check of this.checks) {
            await check(interaction, processedArgument);
        }

        return processedArgument;
    }
}

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
            const command = new Command(path.join(commandsPath, commandFileName));
            
            this.commands.set(command.name, command);
            discordAPICommands.push(command.toDiscordAPI());
        }

        const discordCommandsJSON = JSON.stringify(discordAPICommands);
        const discordCommandsJSONOld = await this.client.redis.get('commands');

        if (discordCommandsJSON != discordCommandsJSONOld) {    
            await restAPI.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: discordAPICommands })
            await this.client.redis.set('commands', discordCommandsJSON);
            
            console.log('New commands found. Succesfully updated commands.');
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