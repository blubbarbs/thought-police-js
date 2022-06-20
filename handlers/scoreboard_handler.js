class ScoreboardHandler {
    constructor(client) {
        this.client = client;
    }

    async getLeaderboard() {
        const allData = await this.client.userDataHandler.get();
        const scores = {};

        for (const [id, data] of Object.entries(allData)) {
            if ('points' in data) {
                scores[id] = data.points;
            }
        }
    
        const leaderboardKeysSorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
        const leaderboard = {};

        for (const key of leaderboardKeysSorted) {
            leaderboard[key] = scores[key];
        }

        return leaderboard;
    }

    async getLeaderboardText() {
        const leaderboard = await this.getLeaderboard();
        let text = '**___LEADERBOARD___**\n\n';

        let ranking = 0;
        for (const [id, score] of Object.entries(leaderboard)) {
            text += `${++ranking}. <@${id}> - ${score}\n`;

            if (ranking == 10) {
                break;
            }
        }

        return text;
    }

    async updateChannel() {
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
    ScoreboardHandler: ScoreboardHandler
}