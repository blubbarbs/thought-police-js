const { parseUser, parseMember, parseChannel, parseRole, parseMentionable, parseInteger, parseNumber, parseBoolean, parseGridCoordinates } = require("./command_arg_parsers");

async function processList(interaction, argName, parser) {
    const rawArg = interaction.options.getString(argName);
    
    if (rawArg == null) {
        return [];
    }
    
    const splitArgs = rawArg.split(/[ ]+/);
    const processedArgs = [];

    for (const arg of splitArgs) {
        const parsedArg = await parser(arg, interaction.channel);

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