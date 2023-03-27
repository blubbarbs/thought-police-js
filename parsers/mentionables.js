const USER_REGEX = /<@!?([0-9]+)>/;
const CHANNEL_REGEX = /<#([0-9]+)>/;
const ROLE_REGEX = /<@&([0-9]+)>/;

async function parseMember(arg, guild) {
    const match = arg.match(USER_REGEX);

    if (match != null) {
        const id = match[1];
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

async function parseUser(arg, guild) {
    const member = await parseMember(arg, guild);

    return member.user;
}

async function parseChannel(arg, guild) {
    const match = arg.match(CHANNEL_REGEX);

    if (match != null) {
        const id = match[1];
        const parsedChannel = await guild.channels.fetch(id);

        if (parsedChannel != null) {
            return parsedChannel;
        }
        else {
            throw 'That channel does not exist.';
        }
    }
    else {
        throw `"${arg}" is not a valid channel.`;
    }
}

async function parseRole(arg, guild) {
    const match = arg.match(ROLE_REGEX);

    if (match != null) {
        const id = match[1];
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

async function parseMentionable(arg, guild) {
    const userMatch = arg.match(USER_REGEX);
    const channelMatch = arg.match(CHANNEL_REGEX);
    const roleMatch = arg.match(ROLE_REGEX);

    if (userMatch != null) {
        return parseUser(arg, guild);
    }
    else if (channelMatch != null) {
        return parseChannel(arg, guild);
    }
    else if (roleMatch != null) {
        return parseRole(arg, guild);
    }
    else {
        throw `"${arg}" is not a valid mentionable.`;
    }
}

module.exports = {
    parseMember: parseMember,
    parseUser: parseUser,
    parseChannel: parseChannel,
    parseRole: parseRole,
    parseMentionable: parseMentionable
}