const { Permissions } = require("discord.js");

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;

class MudaeHandler {    
    constructor(client) {
        this.client = client;
        this.curfewStartHours = 0;
        this.curfewEndHours = 9;
        this.activeTimeoutID = null;
    }

    getCurfewTimes() {
        const beginningOfDay = new Date(Date.now()).setHours(0, 0, 0, 0);
        const curfewStart = new Date(beginningOfDay).setHours(this.curfewStartHours);
        const curfewEnd = new Date(beginningOfDay).setHours(this.curfewEndHours);
    
        return { start: curfewStart, end: curfewEnd };
    }

    async enableMudae(enable) {
        const everyoneRole = await this.client.guild.roles.fetch('209496826204782592');
        const mudaeChannel = await this.getMudaeChannel();

        if (enable) {
            await mudaeChannel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: null });
            await this.updateCurfew();
        }
        else {
            await mudaeChannel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false });
        }
    }

    async applyCurfew(apply) {
        const everyoneRole = await this.client.guild.roles.fetch('209496826204782592');
        const mudaeChannel = await this.getMudaeChannel();
        const isCurfewEnabled = !mudaeChannel.permissionsFor(everyoneRole).has(Permissions.FLAGS.USE_APPLICATION_COMMANDS);
        const isMudaeEnabled = mudaeChannel.permissionsFor(everyoneRole).has(Permissions.FLAGS.VIEW_CHANNEL);

        if (!isMudaeEnabled) {
            console.log('Mudae not enabled');
            return;
        }

        if (apply && !isCurfewEnabled) {
            await mudaeChannel.permissionOverwrites.edit(everyoneRole, { SEND_MESSAGES: false, USE_APPLICATION_COMMANDS : false, ADD_REACTIONS: false });
            await mudaeChannel.send('`This channel is now closed. Mudae will resume at 9 A.M.`');
        }    
        else if (!apply && isCurfewEnabled) {
            await mudaeChannel.permissionOverwrites.edit(everyoneRole, { SEND_MESSAGES: null, USE_APPLICATION_COMMANDS : null, ADD_REACTIONS: null });
            await mudaeChannel.send('`This channel has been re-opened. Mudae will close at 12 A.M.`');    
        }
    }

    async updateCurfew() {
        const curfew = this.getCurfewTimes();
        const currentTime = Date.now();
        let nextUpdateTime = null;

        if (currentTime < curfew.start) {
            await this.applyCurfew(false);

            console.log('Before curfew');

            nextUpdateTime = curfew.start - currentTime + 1;
        }
        else if (currentTime < curfew.end) {
            await this.applyCurfew(true);

            console.log('During curfew');

            nextUpdateTime = curfew.end - currentTime + 1;
        }
        else {
            await this.applyCurfew(false);

            console.log('After curfew');

            nextUpdateTime = curfew.start + DAY_IN_MS - currentTime + 1;
        }
        
        clearTimeout(this.activeTimeoutID);
        this.activeTimeoutID = setTimeout(async () => await this.updateCurfew(), nextUpdateTime); 
    }

    async getMudaeChannel() {
        const channel = await this.client.guild.channels.fetch('810831000572657665');

        return channel;
    }
}

module.exports = {
    MudaeHandler: MudaeHandler
}