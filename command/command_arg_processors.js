const { toCoordinates } = require("../util/grid_coords.js");

const userRegex = /<@!?([0-9]+)>/;
const channelRegex = /<#([0-9]+)>/;
const roleRegex = /<@&([0-9]+)>/;

async function parseMember(arg, interaction) {
    const match = arg.match(userRegex);
    
    if (match != null) {
        const id = match[1];
        const guild = interaction.guild;
        const member = await guild.members.fetch(id);

        if (member != null) {
            return member;
        }
        else {
            throw 'That user is not currently in this discord.';
        }
    }
    else {
        throw `"${arg}" is not a valid user.`;
    }
}

async function parseUser(arg, interaction) {
    const member = await parseMember(arg, interaction);

    return member.user;
}

async function parseChannel(arg, interaction) {
    const match = arg.match(channelRegex);
    
    if (match != null) {
        const id = match[1];
        const guild = interaction.guild;
        const channel = await guild.channels.fetch(id);

        if (channel != null) {
            return channel;
        }
        else {
            throw 'That channel does not exist.';
        }
    }
    else {
        throw `"${arg}" is not a valid channel.`;
    }
}

async function parseRole(arg, interaction) {
    const match = arg.match(roleRegex);
    
    if (match != null) {
        const id = match[1];
        const guild = interaction.guild;
        const role = await guild.roles.fetch(id);

        if (role != null) {
            return role;
        }
        else {
            throw 'That role does not exist.';
        }
    }
    else {
        throw `"${arg}" is not a valid role.`;
    }
}

async function parseMentionable(arg, interaction) {
    const userMatch = arg.match(userRegex);
    const channelMatch = arg.match(channelRegex);
    const roleMatch = arg.match(roleRegex);

    if (userMatch != null) {
        return parseUser(arg, interaction);
    }
    else if (channelMatch != null) {
        return parseChannel(arg, interaction);
    }
    else if (roleMatch != null) {
        return parseRole(arg, interaction);
    }
    else {
        throw `"${arg}" is not a valid mentionable.`;
    }
}

async function parseInteger(arg) {
    if (Number.isSafeInteger(arg)) {
        return +arg;
    }
    else {
        throw 'That is not a valid integer.';
    }
}

async function parseNumber(arg) {
    if (!isNaN(arg)) {
        return +arg;
    }
    else {
        throw 'That is not a valid number.';
    }
}

async function parseBoolean(arg) {
    arg = arg.toLowerCase();

    if (arg == 't' || arg == 'true' || arg == 'yes' || arg == 'y') {
        return true;
    }
    else if (arg == 'f' || arg == 'false' || arg == 'no' || arg == 'n') {
        return false;
    }
    else {
        throw `"${arg}" is not a proper boolean argument.`
    }
}

async function parseGridCoordinates(arg) {
    const coords = toCoordinates(arg);

    if (coords == null) {
        throw 'Those are not valid coordinates. Valid coordinates look like "A1" or "1A".';
    }
    else if (coords[0] == null) {
        throw 'You must input a number for the coordinates to be valid.'
    }
    else if (coords[1] == null) {
        throw 'You must input a letter for the coordinates to be valid.'
    }
    else {
        return coords;
    }
}

async function processList(interaction, argName, parser) {
    const rawArg = interaction.options.getString(argName);
    
    if (rawArg == null) {
        return [];
    }
    
    const splitArgs = rawArg.split(/[ ]+/);
    const processedArgs = [];

    for (const arg of splitArgs) {
        const parsedArg = await parser(arg, interaction);

        processedArgs.push(parsedArg);
    }

    return processedArgs;
}

module.exports = {
    string: (interaction, argName) => interaction.options.getString(argName),
    string_list: (interaction, argName) => interaction.options.getString(argName).split(/[ ]+/),
    user: (interaction, argName) => interaction.options.getUser(argName),
    user_list: (interaction, argName) => processList(interaction, argName, parseUser),
    member: (interaction, argName) => interaction.options.getMember(argName),
    member_list: (interaction, argName) => processList(interaction, argName, parseMember),
    channel: (interaction, argName) => interaction.options.getChannel(argName),
    channel_list: (interaction, argName) => processList(interaction, argName, parseChannel),
    role: (interaction, argName) => interaction.options.getRole(argName),
    role_list: (interaction, argName) => processList(interaction, argName, parseRole),
    mentionable: (interaction, argName) => interaction.options.getMentionable(argName),
    mentionable_list: (interaction, argName) => processList(interaction, argName, parseMentionable),
    integer: (interaction, argName) => interaction.options.getInteger(argName),
    integer_list: (interaction, argName) => processList(interaction, argName, parseInteger),
    number: (interaction, argName) => interaction.options.getNumber(argName),
    number_list: (interaction, argName) => processList(interaction, argName, parseNumber),
    boolean: (interaction, argName) => interaction.options.getBoolean(argName),
    boolean_list: (interaction, argName) => processList(interaction, argName, parseBoolean),
    grid_coordinates: (interaction, argName) => parseGridCoordinates(interaction.options.getString(argName)),
    grid_coordinates_list: (interaction, argName) => processList(interaction, argName, parseGridCoordinates)
}