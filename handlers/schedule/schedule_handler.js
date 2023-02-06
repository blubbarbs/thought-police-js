const { Collection } = require('discord.js');
const { DataHandler } = require('@root/handlers/data/data_handler');
const { Scheduler } = require('./scheduler');

class ScheduleHandler {
    static {
        this.schedulers = new Collection();
    }

    static async loadSchedulers() {
        const promises = [];

        for await (const redisPath of DataHandler.redis.scanIterator({ TYPE: 'hash', MATCH: 's:*'})) {
            const name = redisPath.split(':')[1];
            const scheduler = this.scheduler(name);

            promises.push(scheduler.fetchTasks());
        }

        return Promise.all(promises);
    }

    static async unscheduleAll() {
        for (const scheduler of this.schedulers.values()) {
            for (const scheduleID of scheduler.scheduleIDs.values()) {
                clearTimeout(scheduleID);
            }
        }
    }

    static scheduler(name, callback) {
        const scheduler = this.schedulers.ensure(name, () => new Scheduler(name, () => console.error('Unitialized scheduler ' + name + 'attempted callback')));

        if (callback != null) {
            scheduler.callback = callback;
        }

        return scheduler;
    }
}

module.exports = {
    ScheduleHandler: ScheduleHandler
}