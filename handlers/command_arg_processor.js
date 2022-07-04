const userRegex = /<@!?([0-9]+)>/;
const channelRegex = /<#([0-9]+)>/;
const roleRegex = /<@&([0-9]+)>/;
const gridCoordinatesRegex = /([0-9]+|[A-Za-z]+)([0-9]+|[A-Za-z]+)?/;

const processors = {
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
    grid_coordinates: (interaction, argName) => parseGridCoordinates(interaction, interaction.options.getString(argName)),
    grid_coordinates_list: (interaction, argName) => processList(interaction, argName, parseGridCoordinates)
}

async function parseMember(interaction, arg) {
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

async function parseUser(interaction, arg) {
    const member = await parseMember(interaction, argName);

    return member.user;
}

async function parseChannel(interaction, arg) {
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

async function parseRole(interaction, arg) {
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

async function parseMentionable(interaction, arg) {
    const userMatch = arg.match(userRegex);
    const channelMatch = arg.match(channelRegex);
    const roleMatch = arg.match(roleRegex);

    if (userMatch != null) {
        return parseUser(interaction, arg);
    }
    else if (channelMatch != null) {
        return parseChannel(interaction, arg);
    }
    else if (roleMatch != null) {
        return parseRole(interaction, arg);
    }
    else {
        throw `"${arg}" is not a valid mentionable.`;
    }
}

async function parseInteger(interaction, arg) {
    if (Number.isSafeInteger(arg)) {
        return +arg;
    }
    else {
        throw 'That is not a valid integer.';
    }
}

async function parseNumber(interaction, arg) {
    if (!isNaN(arg)) {
        return +arg;
    }
    else {
        throw 'That is not a valid number.';
    }
}

async function parseBoolean(interaction, arg) {
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

async function parseGridCoordinates(interaction, arg) {
    const match = arg.match(gridCoordinatesRegex);

    if (match == null || match[2] == undefined) {
        throw 'Those are not valid coordinates. Valid coordinates contain a letter and a number put together like "1a" or "a1".';
    }
    else {
        const leftMatch = match[1];
        const rightMatch = match[2];

        const xStr = !isNaN(leftMatch) ? leftMatch : rightMatch;
        const yStr = !isNaN(leftMatch) ? rightMatch.toLowerCase() : leftMatch.toLowerCase();
        const x = +xStr;
        const y = yStr.charCodeAt(0) - 97;

        return [x, y];
    }
}

async function processList(interaction, argName, parser) {
    const rawArg = interaction.options.getString(argName);
    const splitArgs = rawArg.split(/[ ]+/);
    const processedArgs = [];

    for (const arg of splitArgs) {
        const parsedArg = await parser(interaction, arg);

        processedArgs.push(parsedArg);
    }

    return processedArgs;
}

async function processArg(interaction, argName, argType) {
    if (argType in processors) {
        return processors[argType](interaction, argName);
    }
    else {
        return processors['string'](interaction, argName);
    } 
}

module.exports = {
    processArg: processArg
}