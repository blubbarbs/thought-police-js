const { database, getGuild } = require('../bot.js');

const USER_INFO = database.createNamespace('user_info');
const LEADERBOARD_CHANNEL_ID = '987990655601102899';
const REWARDS = {
    change_nickname: {
        price: 50,
        display: 'Change User Nickname',
        description: 'Change the nickname for a specific player for one entire day.'
    },
    change_theme: {
        price: 100,
        display: 'Change Server Theme',
        description: 'Change the server theme for one entire day.'
    },
    new_sticker: {
        price: 400,
        display: 'New Sticker',
        description: 'Add a new sticker for the server.'
    }
}

async function hasEnoughPoints(interaction, reward) {
    const points = await getPoints(interaction.member.id);
    const rewardPrice = REWARDS[reward].price;

    if (points < rewardPrice) {
        throw `You need **${rewardPrice - points}** more points in order to purchase this reward.`;
    }
}

async function getPoints(id) {
    const points = await USER_INFO.get(id, 'points');

    return +points;
}

async function setPoints(id, points, shouldUpdateLeaderboard) {
    await USER_INFO.set(id, 'points', points);

    if (shouldUpdateLeaderboard == null || shouldUpdateLeaderboard == true) {
        await updateLeaderboard();
    }
}

async function addPoints(id, deltaPoints, shouldUpdateLeaderboard) {
    const currentPoints = await getPoints(id);
    const newPoints = currentPoints + deltaPoints;

    await setPoints(id, currentPoints + deltaPoints, shouldUpdateLeaderboard);

    return newPoints;
}

async function getLeaderboardChannel() {
    const guild = await getGuild();
    const channel = await guild.channels.fetch(LEADERBOARD_CHANNEL_ID);

    return channel;
}

async function getLeaderboard(end, start) {
    const scores = await USER_INFO.get(null, 'points');
    const leaderboardKeysSorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const leaderboard = [];
    start = start == null || start < 0 ? 0 : start;
    end = end == null || end >= leaderboardKeysSorted.length ? leaderboardKeysSorted.length : end;

    for (let i = start; i < end; i++) {
        const key = leaderboardKeysSorted[i];
        leaderboard[i] = { rank: '' + (i + 1), points: '' + scores[key], id: key };
    }

    return leaderboard;
}

async function getLeaderboardText() {
    const leaderboard = await getLeaderboard(10);
    let text = '**___LEADERBOARD___**\n\n';

    if (leaderboard.length == 0) {
        return text;
    }
    else {
        const top = leaderboard[0];
        const bottom = leaderboard[leaderboard.length - 1];

        for (const entry of leaderboard) {
            const paddedRankingString = `${entry.rank}.`.padEnd(bottom.rank.length, ' ');
            const paddedPointsString = `${entry.points.padEnd(top.points.length, ' ')} points`;

            text += `\`${paddedRankingString} ${paddedPointsString}\` - <@${entry.id}>\n`;
        }

        return text;
    }
}

async function updateLeaderboard() {
    const leaderboardChannel = await getLeaderboardChannel();
    const leaderboardMessages = await leaderboardChannel.messages.fetch({ limit: 1 });
    const leaderboardText = await getLeaderboardText();
    let leaderboardMessage = null;

    if (leaderboardMessages.size == 0) {
        leaderboardMessage = await leaderboardChannel.send('Placeholder, should not be seen');
    }
    else {
        leaderboardMessage = leaderboardMessages.first();
    }

    await leaderboardMessage.edit(leaderboardText);
}

module.exports = {
    getPoints: getPoints,
    setPoints: setPoints,
    addPoints: addPoints,
    getLeaderboard: getLeaderboard,
    getLeaderboardText: getLeaderboardText,
    getLeaderboardChannel: getLeaderboardChannel,
    updateLeaderboard: updateLeaderboard,
    checks: {
        hasEnoughPoints: hasEnoughPoints
    },
    REWARDS: REWARDS
}