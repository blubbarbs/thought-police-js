const fs = require('node:fs');
const path = require('node:path');
const { processArg } = require('./command_arg_processor.js');
const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');

const restAPI = new REST({ version: '9' }).setToken(process.env.TOKEN);

function getCommandArgumentChoices(choices) {
    const choiceList = [];

    if (Array.isArray(choices)) {
        for (const choice of choices) {
            choiceList.push({ name: choice, value: choice });
        }
    }
    else {
        for (const [value, name] of Object.entries(choices)) {
            choiceList.push({ name: name, value: value });
        }
    }

    return choiceList;
}

function createOptionBuilder(arg) {
    return (optionBuilder => {
        optionBuilder.setName(arg.name);
        optionBuilder.setDescription(arg.description);
        
        if ('optional' in arg) {
            optionBuilder.setRequired(!arg.optional);
        }
        
        if ('choices' in arg) {
            optionBuilder.addChoices(...getCommandArgumentChoices(arg?.choices));
        }

        return optionBuilder;
    });
}

function buildCommandArguments(commandBuilder, args) {
    if (args == null) {
        return;
    }
    
    for (const arg of Object.values(args)) {
        switch (arg?.type) {
            case 'string':
                commandBuilder.addStringOption(createOptionBuilder(arg));   
                break;
            case 'int':
            case 'integer':
                commandBuilder.addIntegerOption(createOptionBuilder(arg));           
                break;
            case 'bool':
            case 'boolean':
                commandBuilder.addBooleanOption(createOptionBuilder(arg));           
                break;
            case 'number':
                commandBuilder.addNumberOption(createOptionBuilder(arg));           
                break;
            case 'user':
                commandBuilder.addUserOption(createOptionBuilder(arg));           
                break;
            case 'member':
                commandBuilder.addUserOption(createOptionBuilder(arg));           
                break;    
            case 'channel':
                commandBuilder.addChannelOption(createOptionBuilder(arg));           
                break;
            case 'role':
                commandBuilder.addRoleOption(createOptionBuilder(arg));           
                break;
            case 'mentionable':
                commandBuilder.addMentionableOption(createOptionBuilder(arg));           
                break;
            case 'attachment':
                commandBuilder.addAttachmentOption(createOptionBuilder(arg));           
                break;
            default:
                commandBuilder.addStringOption(createOptionBuilder(arg));           
                break; 
        }
    }
}

function readCommand(commandPath) {
    let command = null;

    if (commandPath.endsWith('.js')) {        
        command = { name: path.basename(commandPath, '.js'), ...require(commandPath) };
    }
    else if (fs.existsSync(path.join(commandPath, '.js'))) {
        command = { name: path.basename(commandPath), ...require(path.join(commandPath, '.js')), subcommands: {} };

        for (const subcommandFileName of fs.readdirSync(commandPath)) {
            const subcommandName = path.basename(subcommandFileName, '.js');
            
            if (subcommandFileName != '.js' && subcommandFileName.endsWith('.js')) {
                command.subcommands[subcommandName] = readCommand(path.join(commandPath, subcommandFileName));
            }            
        }
    }

    if ('args' in command) {
        for (const [name, arg] of Object.entries(command.args)) {
            arg.name = name;
        }
    }

    return command;
}

function readCommandFolder(commandsPath) {
    const commands = {};
    
    for (const commandFileName of fs.readdirSync(commandsPath)) {
        const commandName = path.basename(commandFileName, '.js');

        commands[commandName] = readCommand(path.join(commandsPath, commandFileName));
    }

    return commands;
}

function buildSlashCommand(command) {
    const slashCommandBuilder = new SlashCommandBuilder();

    slashCommandBuilder.setName(command.name);
    slashCommandBuilder.setDescription(command.description);
    slashCommandBuilder.setDMPermission(command?.permitDM);
    buildCommandArguments(slashCommandBuilder, command?.args);

    if ('subcommands' in command) {
        for (const subcommand of Object.values(command.subcommands)) {
            if ('subcommands' in subcommand) {
                const subcommandGroupBuilder = new SlashCommandSubcommandGroupBuilder();

                for (const subsubcommand of subcommand.subcommands) {
                    const subsubcommandBuilder = new SlashCommandSubcommandBuilder();

                    subsubcommandBuilder.setName(subsubcommand.name);
                    subsubcommandBuilder.setDescription(command.description);
                    buildCommandArguments(subsubcommandBuilder, subcommand?.args);
                    
                    subcommandGroupBuilder.addSubcommand(subsubcommandBuilder);
                }

                slashCommandBuilder.addSubcommandGroup(subcommandGroupBuilder);
            }
            else {
                const subcommandBuilder = new SlashCommandSubcommandBuilder();

                subcommandBuilder.setName(subcommand.name);
                subcommandBuilder.setDescription(command.description);
                buildCommandArguments(subcommandBuilder, subcommand?.args);

                slashCommandBuilder.addSubcommand(subcommandBuilder);
            }
        }
    }

    return slashCommandBuilder;
}

async function onInteract(interaction) {
    if (!interaction.isCommand()) {
        return;
    }

    try {
        const commandHandler = interaction.client.commandHandler;
        const command = commandHandler.getCommand(interaction.commandName, interaction.options._group, interaction.options._subcommand);
    
        if ('permissions' in command && !interaction.member.permissions.has(command.permissions)) {
            await interaction.reply({ content: 'You do not have permission to use this command. ', ephemeral: true });
            return;
        }
    
        const args = {};
        if ('args' in command) {
            for (const [name, arg] of Object.entries(command.args)) {            
                args[name] = await processArg(interaction, name, arg?.type);
                
                if ('permissions' in arg && args[name] != null && !interaction.member.permissions.has(arg.permissions)) {
                    await interaction.reply({ content: `You do not have permission to use the "${name}" argument.`, ephemeral: true });
                    return;
                }

                if ('check' in arg) {
                    const argChecks = Array.isArray(arg.check) ? arg.check : [arg.check];
                    
                    for (const check of argChecks) {
                        if (args[name] != null) {
                            await check(interaction, args[name]);
                        }
                    }
                }
            }
        }

        if ('check' in command) {
            const commandChecks = Array.isArray(command.check) ? command.check : [command.check];
                    
            for (const check of commandChecks) {
                await check(interaction, args);       
            }
        }

        await command.execute(interaction, args);  
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
    }

    getCommand(commandName, subcommandGroupName, subcommandName) {
        let command = this.commands[commandName];

        if (subcommandGroupName != null) {
            command = command.subcommands[subcommandGroupName];
        }

        if (subcommandName != null) {
            command = command.subcommands[subcommandName];
        }

        return command;
    }

    reloadCommands(commandsPath) {
        this.commands = readCommandFolder(commandsPath);
        const slashCommandBuilders = [];

        for (const [name, command] of Object.entries(this.commands)) {
            slashCommandBuilders.push(buildSlashCommand(command));
        }

        restAPI.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: slashCommandBuilders })
        .then(() =>  {
            console.log('Successfully registered commands.');
            this.client.on('interactionCreate', onInteract);
        })
        .catch(console.error);
    }
}

module.exports = {
    CommandHandler: CommandHandler
}
