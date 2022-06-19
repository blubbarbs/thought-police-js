const fs = require('node:fs');
const path = require('node:path');
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

function createOptionBuilder(name, arg) {
    return (optionBuilder => {
        optionBuilder.setName(name);
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
    if (args == null || args == undefined) {
        return;
    }
    
    for (const [name, arg] of Object.entries(args)) {
        switch (arg?.type) {
            case 'string':
                commandBuilder.addStringOption(createOptionBuilder(name, arg));   
                break;
            case 'int':
            case 'integer':
                commandBuilder.addIntegerOption(createOptionBuilder(name, arg));           
                break;
            case 'bool':
            case 'boolean':
                commandBuilder.addBooleanOption(createOptionBuilder(name, arg));           
                break;
            case 'number':
                commandBuilder.addNumberOption(createOptionBuilder(name, arg));           
                break;
            case 'user':
                commandBuilder.addUserOption(createOptionBuilder(name, arg));           
                break;
            case 'member':
                commandBuilder.addUserOption(createOptionBuilder(name, arg));           
                break;    
            case 'channel':
                commandBuilder.addChannelOption(createOptionBuilder(name, arg));           
                break;
            case 'role':
                commandBuilder.addRoleOption(createOptionBuilder(name, arg));           
                break;
            case 'mentionable':
                commandBuilder.addMentionableOption(createOptionBuilder(name, arg));           
                break;
            case 'attachment':
                commandBuilder.addAttachmentOption(createOptionBuilder(name, arg));           
                break;
            default:
                commandBuilder.addStringOption(createOptionBuilder(name, arg));           
                break; 
        }
    }
}

async function onInteract(interaction) {
    if (!interaction.isCommand()) {
        return;
    }

    const commands = interaction.client.commandHandler.commands;
    let commandName = interaction.commandName;
    commandName += interaction.options._group != null ? `.${interaction.options._group}` : '';
    commandName += interaction.options._subcommand != null ? `.${interaction.options._subcommand}` : '';
    const command = commands.get(commandName);

    if ('permissions' in command && !interaction.member.permissions.has(command.permissions)) {
        await interaction.reply({ content: 'You do not have permission to use this command. ', ephemeral: true });
        return;
    }

    const args = {};

    if ('args' in command) {
        for (const [name, arg] of Object.entries(command.args)) {            
            switch (arg?.type) {
                case 'string':
                    args[name] = interaction.options.getString(name);
                    break;
                case 'int':
                case 'integer':
                    args[name] = interaction.options.getInteger(name);
                    break;
                case 'bool':
                case 'boolean':
                    args[name] = interaction.options.getBoolean(name);
                    break;
                case 'number':
                    args[name] = interaction.options.getNumber(name);
                    break;
                case 'user':
                    args[name] = interaction.options.getUser(name);
                    break;
                case 'member':
                    args[name] = interaction.options.getMember(name);
                    break;                    
                case 'channel':
                    args[name] = interaction.options.getChannel(name);
                    break;
                case 'role':
                    args[name] = interaction.options.getRole(name);
                    break;
                case 'mentionable':
                    args[name] = interaction.options.getMentionable(name);
                    break;
                case 'attachment':
                    args[name] = interaction.options.getAttachment(name);
                    break;
                default:
                    args[name] = interaction.options.getString(name);
                    break; 
            }
            
            if ('permissions' in arg && args[name] != null && !interaction.member.permissions.has(arg.permissions)) {
                await interaction.reply({ content: `You do not have permission to use the "${name}" argument.`, ephemeral: true });
                return;
            }

            if ('check' in arg) {
                const argChecks = Array.isArray(arg.check) ? arg.check : [arg.check];
                
                for (const check of argChecks) {
                    const checkResult = await check(interaction, args[name]);
                    
                    if (typeof checkResult == 'string') {
                        await interaction.reply({ content: checkResult, ephemeral: true });
                        return;
                    }
                }
            }
        }
    }
    
    if ('check' in command) {
        const commandChecks = Array.isArray(command.check) ? command.check : [command.check];

        for (const check of commandChecks) {
            const checkResult = await check(interaction, args);
                    
            if (typeof checkResult == 'string') {
                await interaction.reply({ content: checkResult, ephemeral: true });
                return;
            }
        }
    }

    try {
        await command.execute(interaction, args);
    } 
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}    

async function defaultSubcommandGroupExecute(interaction) {
    await interaction.reply({ content: 'You need to specify a subcommand to run this function.', ephemeral: true });
}

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
    }

    reloadCommands(commandsPath) {
        const fileNames = fs.readdirSync(commandsPath);
        const slashCommandBuilders = [];
    
        for (const fileName of fileNames) {
            const slashCommandBuilder = new SlashCommandBuilder();
    
            if (fileName.endsWith('.js')) {
                const command = require(path.join(commandsPath, fileName));
                const commandName = fileName.substring(0, fileName.length - 3);
    
                slashCommandBuilder.setName(commandName);
                slashCommandBuilder.setDescription(command.description);
                slashCommandBuilder.setDMPermission(command?.permitDM);
                buildCommandArguments(slashCommandBuilder, command?.args);

                slashCommandBuilders.push(slashCommandBuilder);
                this.commands.set(commandName, command);
            }
            else if (!fileName.includes('.') && fs.existsSync(path.join(commandsPath, fileName, '.js'))) {
                const commandsPath2 = path.join(commandsPath, fileName);
                const fileNames2 = fs.readdirSync(commandsPath2);
        
                for (const fileName2 of fileNames2) {
                    if (fileName2 == '.js') {
                        const data = require(path.join(commandsPath2, fileName2));

                        slashCommandBuilder.setName(fileName);
                        slashCommandBuilder.setDescription(data.description);

                        slashCommandBuilders.push(slashCommandBuilder);
                        this.commands.set(fileName, { execute: defaultSubcommandGroupExecute, ...data });
                    }
                    else if (fileName2.endsWith('.js')) {
                        const subcommand = require(path.join(commandsPath2, fileName2));
                        const subcommandName = fileName2.substring(0, fileName2.length - 3);
                        const slashsubCommandBuilder = new SlashCommandSubcommandBuilder();                    
    
                        slashsubCommandBuilder.setName(subcommandName);
                        slashsubCommandBuilder.setDescription(subcommand.description);
                        buildCommandArguments(slashsubCommandBuilder, subcommand?.args);
                        
                        slashCommandBuilder.addSubcommand(slashsubCommandBuilder);
                        this.commands.set(fileName + '.' + subcommandName, subcommand);
                    }
                    else if (!fileName2.includes('.') && fs.existsSync(path.join(commandsPath2, fileName2, '.js'))) {
                        const commandsPath3 = path.join(commandsPath2, fileName2)
                        const fileNames3 = fs.readdirSync(commandsPath3);
                        const slashsubCommandGroupBuilder = new SlashCommandSubcommandGroupBuilder();
    
                        for (const fileName3 of fileNames3) {
                            if (fileName3 == '.js') {
                                const data = require(path.join(commandsPath3, fileName3));

                                slashsubCommandGroupBuilder.setName(fileName2);
                                slashsubCommandGroupBuilder.setDescription(data.description);

                                slashCommandBuilder.addSubcommandGroup(slashsubCommandGroupBuilder);
                            }
                            else if (fileName3.endsWith('.js')) {
                                const subcommand = require(path.join(commandsPath3, fileName3));
                                const subcommandName = fileName3.substring(0, fileName3.length - 3);
                                const slashsubCommandBuilder = new SlashCommandSubcommandBuilder();
    
                                slashsubCommandBuilder.setName(subcommandName);
                                slashsubCommandBuilder.setDescription(subcommand.description);
                                buildCommandArguments(slashsubCommandBuilder, subcommand?.args);
                                
                                slashsubCommandGroupBuilder.addSubcommand(slashsubCommandBuilder);
                                this.commands.set(fileName + '.' + fileName2 + '.' + subcommandName, subcommand);
                            }
                        }
                    }
                }
            }    
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
