class PointsHandler {
    constructor(pointsChannel) {
        this.pointsChannel = pointsChannel;
    }

    async getLeaderboardText() {
        const text = '**___LEADERBOARD___**\n\n';
        
        

    }

    async updateChannel() {
        const messages = await this.pointsChannel.messages.fetch({ limit: 1 });
        const leaderboardMessage = null;

        if (messages.size == 0) {
            leaderboardMessage = this.pointsChannel.send('Placeholder, should not be seen');
        }
        else {
            leaderboardMessage = messages.first();
        }

        await leaderboardMessage.edit()
    }
}

module.exports = {
    PointsHandler: PointsHandler
}