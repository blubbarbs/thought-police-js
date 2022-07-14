const { getGuild } = require('../bot.js');
const { Permissions } = require("discord.js");

const EVERYONE_ROLE_ID = '209496826204782592';
const MUDAE_CHANNEL_ID = '810831000572657665';
const CURFEW_START_HOURS = 0;
const CURFEW_END_HOURS = 9;
const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;

class MudaeHandler {
    static {
        this.activeTimeoutID = null;
    }

    static getCurfewTimes() {
        const beginningOfDay = new Date(Date.now()).setHours(0, 0, 0, 0);
        const curfewStart = new Date(beginningOfDay).setHours(CURFEW_START_HOURS);
        const curfewEnd = new Date(beginningOfDay).setHours(CURFEW_END_HOURS);
    
        return { start: curfewStart, end: curfewEnd };
    }
    
    static async enableMudae(enable) {
        const mudaeChannel = await this.getMudaeChannel();
    
        if (enable) {
            await mudaeChannel.permissionOverwrites.edit(EVERYONE_ROLE_ID, { VIEW_CHANNEL: null });
            await this.updateCurfew();
        }
        else {
            await mudaeChannel.permissionOverwrites.edit(EVERYONE_ROLE_ID, { VIEW_CHANNEL: false });
        }
    }
    
    static async applyCurfew(apply) {
        const mudaeChannel = await this.getMudaeChannel();
        const isCurfewEnabled = !mudaeChannel.permissionsFor(EVERYONE_ROLE_ID).has(Permissions.FLAGS.USE_APPLICATION_COMMANDS);
        const isMudaeEnabled = mudaeChannel.permissionsFor(EVERYONE_ROLE_ID).has(Permissions.FLAGS.VIEW_CHANNEL);
    
        if (!isMudaeEnabled) return;
    
        if (apply && !isCurfewEnabled) {
            await mudaeChannel.permissionOverwrites.edit(EVERYONE_ROLE_ID, { SEND_MESSAGES: false, USE_APPLICATION_COMMANDS: false, ADD_REACTIONS: false });
            await mudaeChannel.send('`This channel is now closed. Mudae will resume at 9 A.M.`');
        }
        else if (!apply && isCurfewEnabled) {
            await mudaeChannel.permissionOverwrites.edit(EVERYONE_ROLE_ID, { SEND_MESSAGES: null, USE_APPLICATION_COMMANDS: null, ADD_REACTIONS: null });
            await mudaeChannel.send('`This channel has been re-opened. Mudae will close at 12 A.M.`');
        }
    }
    
    static async updateCurfew() {
        const curfew = this.getCurfewTimes();
        const currentTime = Date.now();
        let nextUpdateTime = null;
    
        if (currentTime < curfew.start) {
            await this.applyCurfew(false);
        
            nextUpdateTime = curfew.start - currentTime + 1;
        }
        else if (currentTime < curfew.end) {
            await this.applyCurfew(true);
        
            nextUpdateTime = curfew.end - currentTime + 1;
        }
        else {
            await this.applyCurfew(false);
        
            nextUpdateTime = curfew.start + DAY_IN_MS - currentTime + 1;
        }
    
        clearTimeout(this.activeTimeoutID);
        this.activeTimeoutID = setTimeout(async () => await this.updateCurfew(), nextUpdateTime);
    }
    
    static async haltCurfew() {
        clearTimeout(this.activeTimeoutID);
    }
    
    static async getMudaeChannel() {
        const guild = await getGuild();
        const channel = await guild.channels.fetch(MUDAE_CHANNEL_ID);
    
        return channel;
    }    
}

module.exports = {
    MudaeHandler: MudaeHandler
}