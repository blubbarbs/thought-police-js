const { Collection } = require('discord.js');
const { Scheduler } = require('./scheduler');
const { client } = require('@bot');

class ScheduleHandler {
    static {
        this.schedulers = new Collection();
    }

    static async loadSchedulers() {
        const promises = [];

        for (const scheduler of this.schedulers.values()) {
            promises.push(scheduler.fetchTasks());
        }

        return Promise.all(promises);
    }

    static async unloadAll() {
        for (const scheduler of this.schedulers.values()) {
            for (const scheduleID of scheduler.scheduleIDs.values()) {
                clearTimeout(scheduleID);
            }
        }
    }

    static registerScheduler(name, callback) {
        if (client.isReady()) {
            throw 'Cannot register a scheduler if the bot is already running!';
        }
        else {
            const scheduler = new Scheduler(name, callback);
            this.schedulers.set(name, scheduler);
            return scheduler;
        }
    }
}

module.exports = {
    ScheduleHandler: ScheduleHandler
}