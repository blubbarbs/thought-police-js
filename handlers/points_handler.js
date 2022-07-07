class PointsHandler {
    constructor(client) {
        this.client = client;
    }

    async getPoints(id) {
        const points = await this.client.userDataHandler.get(id, 'points');

        return +points;
    }

    async setPoints(id, points, updateLeaderboard) {
        await this.client.userDataHandler.set(id, 'points', points);

        if (updateLeaderboard == null || updateLeaderboard == true) {
            await this.updateLeaderboard();
        }
    }

    async addPoints(id, deltaPoints, updateLeaderboard) {
        const currentPoints = await this.getPoints(id);

        await this.setPoints(id, currentPoints + deltaPoints, updateLeaderboard);
    }

    async getLeaderboard(end, start) {
        const scores = await this.client.userDataHandler.get(null, 'points');    
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

    async getLeaderboardText() {
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

    async updateLeaderboard() {
        const messages = await this.client.scoreboardChannel.messages.fetch({ limit: 1 });
        const leaderboardText = await this.getLeaderboardText();
        let leaderboardMessage = null;

        if (messages.size == 0) {
            leaderboardMessage = await this.client.scoreboardChannel.send('Placeholder, should not be seen');
        }
        else {
            leaderboardMessage = messages.first();
        }

        await leaderboardMessage.edit(leaderboardText);
    }
}

module.exports = {
    PointsHandler: PointsHandler
}