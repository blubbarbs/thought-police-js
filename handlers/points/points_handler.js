const { getGuild } = require('@bot');
const { UserData } = require('@data');

const LEADERBOARD_CHANNEL_ID = '987990655601102899';

class PointsHandler {
    static {
        this.rewards = {
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

        this.points = UserData.node('points');
    }

    static async getPoints(id) {
        return this.points.get(id);
    }

    static async setPoints(id, points, shouldUpdateLeaderboard = true) {
        this.points.set(id, points);

        if (shouldUpdateLeaderboard) {
            await this.updateLeaderboard();
        }
    }

    static async addPoints(id, deltaPoints, shouldUpdateLeaderboard = true) {
        this.points.add(id, deltaPoints);

        if (shouldUpdateLeaderboard) {
            await this.updateLeaderboard();
        }
    }

    static async getLeaderboard(end, start) {
        const leaderboardKeysSorted = Array.from(this.points.keys()).sort((a, b) => this.points[b] - this.points[a]);
        const leaderboard = [];
        start = start == null || start < 0 ? 0 : start;
        end = end == null || end >= leaderboardKeysSorted.length ? leaderboardKeysSorted.length : end;

        for (let i = start; i < end; i++) {
            const key = leaderboardKeysSorted[i];
            leaderboard[i] = { rank: '' + (i + 1), points: '' + this.points.get(key), id: key };
        }

        return leaderboard;
    }

    static async getLeaderboardText() {
        const leaderboard = await this.getLeaderboard(10);
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

    static async updateLeaderboard() {
        const leaderboardChannel = await this.getLeaderboardChannel();
        const leaderboardMessages = await leaderboardChannel.messages.fetch({ limit: 1 });
        const leaderboardText = await this.getLeaderboardText();
        let leaderboardMessage = null;

        if (leaderboardMessages.size == 0) {
            leaderboardMessage = await leaderboardChannel.send('Placeholder, should not be seen');
        }
        else {
            leaderboardMessage = leaderboardMessages.first();
        }

        await leaderboardMessage.edit(leaderboardText);
    }

    static async getLeaderboardChannel() {
        const guild = await getGuild();
        const channel = await guild.channels.fetch(LEADERBOARD_CHANNEL_ID);

        return channel;
    }
}

module.exports = {
    PointsHandler: PointsHandler
}