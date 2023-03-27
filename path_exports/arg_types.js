const { parseInteger,
        parseNumber,
        parseBoolean } = require('@root/parsers/basic_data_types');
const { parseUser,
        parseMember,
        parseRole,
        parseChannel,
        parseMentionable } = require('@root/parsers/mentionables');
const { parseGridCoordinates } = require('@root/parsers/grid_coords');

function createListProcessor(parser) {
    async function listProcessor(interaction, argName) {
        const rawArg = interaction.options.getString(argName);

        if (rawArg == null) {
            return [];
        }

        const splitArgs = rawArg.split(/[ ]+/);
        const parsedArgs = [];

        for (const arg of splitArgs) {
            const parsedArg = await parser(arg, interaction.guild);

            parsedArgs.push(parsedArg);
        }

        return parsedArgs;
    }

    return listProcessor;
}

class ArgType {
    constructor({ discordAPIType = null, processSingle, processList }) {
        this.isDefaultType = discordAPIType != null;
        this.discordAPIType = discordAPIType || 3;
        this.processSingle = processSingle;
        this.processList = processList;
    }
}

module.exports = {
    STRING: new ArgType({
        discordAPIType: 3,
        processSingle: (interaction, argName) => interaction.options.getString(argName),
        processList: createListProcessor((s) => s)
    }),
    INTEGER: new ArgType({
        discordAPIType: 4,
        processSingle: (interaction, argName) => interaction.options.getInteger(argName),
        processList: createListProcessor(parseInteger)
    }),
    BOOLEAN: new ArgType({
        discordAPIType: 5,
        processSingle: (interaction, argName) => interaction.options.getBoolean(argName),
        processList: createListProcessor(parseBoolean)
    }),
    USER: new ArgType({
        discordAPIType: 6,
        processSingle: (interaction, argName) => interaction.options.getUser(argName),
        processList: createListProcessor(parseUser)
    }),
    MEMBER: new ArgType({
        discordAPIType: 6,
        processSingle: (interaction, argName) => interaction.options.getMember(argName),
        processList: createListProcessor(parseMember)
    }),
    CHANNEL: new ArgType({
        discordAPIType: 7,
        processSingle: (interaction, argName) => interaction.options.getChannel(argName),
        processList: createListProcessor(parseChannel)
    }),
    ROLE: new ArgType({
        discordAPIType: 8,
        processSingle: (interaction, argName) => interaction.options.getRole(argName),
        processList: createListProcessor(parseRole)
    }),
    MENTIONABLE: new ArgType({
        discordAPIType: 9,
        processSingle: (interaction, argName) => interaction.options.getMentionable(argName),
        processList: createListProcessor(parseMentionable)
    }),
    NUMBER: new ArgType({
        discordAPIType: 10,
        processSingle: (interaction, argName) => interaction.options.getNumber(argName),
        processList: createListProcessor(parseNumber)
    }),
    ATTACHMENT: new ArgType({
        discordAPIType: 11,
        processSingle: (interaction, argName) => interaction.options.getAttachment(argName),
        processList: createListProcessor((s) => s)
    }),
    GRID_COORDINATES: new ArgType({
        processSingle: (interaction, argName) => parseGridCoordinates(interaction.options.getString(argName)),
        processList: createListProcessor(parseGridCoordinates)
    }),
}