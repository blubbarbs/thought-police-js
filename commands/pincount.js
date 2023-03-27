const ArgTypes = require('@command-arg-types');

async function countGlobalPins(guild, member) {
    const channels = await guild.channels.fetch();
    const textChannels = channels.filter(c => c.viewable && c.type == 'GUILD_TEXT' && (c.name.includes('general') || c.name.includes('archive')));
    const countingPromises = [];

    for (const textChannel of textChannels.values()) {
        countingPromises.push(countPins(textChannel, member));
    }

    let pinCount = 0;
    const counts = await Promise.all(countingPromises);

    for (const count of counts) {
        pinCount += count;
    }

    return pinCount;
}

async function countPins(textChannel, member) {
    const pinnedMessages = await textChannel.messages.fetchPinned();
    const pinCount = pinnedMessages.filter(m => m.author.id == member.id).size;

    return pinCount;
}

async function execute(interaction, args) {
    const target = args['target'] || interaction.member;
    const channel = args['channel'];

    if (channel == null) {
        await interaction.deferReply({ ephemeral: true });
        const count = await countGlobalPins(interaction.guild, target);

        if (target == interaction.member) {
            await interaction.editReply(`Your total pin count for the server is: ${count}.`);
        }
        else {
            await interaction.editReply(`The total pin count for ${target} on the server is: ${count}.`);
        }
    }
    else {
        const count = await countPins(channel, target);

        if (target == interaction.member) {
            await interaction.reply({ content: `Your total pin count in ${channel} is: ${count}.`, ephemeral: true });
        }
        else {
            await interaction.reply({ content: `The total pin count for ${target} in ${channel} is: ${count}.`, ephemeral: true });
        }
    }
}

module.exports = {
    description: 'Counts the amount of pins a user has.',
    args: {
        target: {
            type: ArgTypes.MEMBER,
            description: 'User whose pins you want to see.'
        },
        channel: {
            type: ArgTypes.CHANNEL,
            description: 'Channel where you want to count the pins.'
        }
    },
    execute: execute
}