const { getGuild } = require('@bot');

const ANNOUNCEMENT_CHANNEL_ID = '794518074425475072';

class RoleHandler {
    static async getAnnoucementChannel() {
        const guild = await getGuild();
        const channel = await guild.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);

        return channel;
    }

    static async awardRole(role, reason, ...targets) {
        const announcementChannel = await this.getAnnoucementChannel();
        let announcement = '';

        for (const target of targets) {
            await target.roles.add(role, reason);
        }

        if (targets.length == 1) {
            const target = targets[0];

            announcement += `${target} has been awarded the ${role} role!`;
        }
        else if (targets.length == 2) {
            const target1 = targets[0];
            const target2 = targets[1];

            announcement += `${target1} and ${target2} have been awarded the ${role} role!`;
        }
        else {
            const finalTarget = targets.pop();

            announcement += `${targets.join(', ')}, and ${finalTarget} have been awarded the ${role} role!`;
        }

        announcement += `\n\`REASON: ${reason}\``;

        await announcementChannel.send(announcement);
    }
}

module.exports = {
    RoleHandler: RoleHandler
}