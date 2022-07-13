const { database, getGuild } = require('../bot.js');

const LEADERBOARD_CHANNEL_ID = '987990655601102899';

class PointsHandler {
    static {
        this.remoteData = database.getNamespace('user_info');
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
    }
    
    static async getPoints(id) {
        const points = await this.remoteData.get('points', id);
    
        return points || 0;
    }
    
    static async setPoints(id, points, shouldUpdateLeaderboard) {
        await this.remoteData.set('points', id, points);
    
        if (shouldUpdateLeaderboard == null || shouldUpdateLeaderboard == true) {
            await this.updateLeaderboard();
        }
    }
    
    static async addPoints(id, deltaPoints, shouldUpdateLeaderboard) {
        const currentPoints = await this.getPoints(id);
        const newPoints = currentPoints + deltaPoints;
    
        await this.setPoints(id, currentPoints + deltaPoints, shouldUpdateLeaderboard);
    
        return newPoints;
    }
    
    static async getLeaderboardChannel() {
        const guild = await getGuild();
        const channel = await guild.channels.fetch(LEADERBOARD_CHANNEL_ID);
    
        return channel;
    }
    
    static async getLeaderboard(end, start) {
        const scores = await this.remoteData.get('points');        
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
}

module.exports = {
    PointsHandler: PointsHandler
}