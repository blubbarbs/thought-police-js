class MudaeHandler {
    constructor(client) {
        this.client = client;
    }

    async getMudaeChannel() {
        const channel = await this.client.guild.channels.fetch('848099339674845195');

        return channel;
    }

    async getCurfew() {
        const currentDate = new Date(Date.now());

    }
}