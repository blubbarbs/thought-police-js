const { Collection } = require('discord.js');
const { DataHandler } = require('./data_handler')
const crypto = require('crypto');

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

class Scheduler {
    constructor(name, callback) {
        this.name = name;
        this.callback = callback;
        this.scheduleIDs = new Collection();
        this.taskData = new Collection();
        this.redisPath = `s:${this.name}`;
    }

    async fetchTasks() {
        const data = await DataHandler.redis.hGetAll(this.redisPath);

        for (let [taskID, taskData] of Object.entries(data)) {
            taskData = JSON.parse(taskData);
            const timeMillis = Math.max(taskData._timeout - Date.now(), 0);

            this.scheduleIDs.set(taskID, setTimeout(this._timeoutCallback(taskID, taskData), timeMillis));
            this.taskData.set(taskData, taskData);
        }
    }

    _timeoutCallback(taskID, data) {
        return async () => {
            await this.callback(data);
            this.unschedule(taskID);
        };
    }

    schedule(data, timeMillis, taskID) {
        taskID = taskID || crypto.randomUUID();
        data = { _id: taskID, _timeout: Date.now() + timeMillis, ...data };

        if (this.scheduleIDs.has(taskID)) {
            this.unschedule(taskID);
        }

        this.scheduleIDs.set(taskID, setTimeout(this._timeoutCallback(taskID, data), timeMillis));
        this.taskData.set(taskID, data);
        DataHandler.redis.hSet(this.redisPath, taskID, JSON.stringify(data))
        .catch(() => console.error('Failed to write scheduler ' + this.redisPath));

        return taskID;
    }

    unschedule(taskID) {
        clearTimeout(this.scheduleIDs.get(taskID));
        this.scheduleIDs.delete(taskID);
        this.taskData.delete(taskID);
        DataHandler.redis.hDel(this.redisPath, taskID)
        .catch(() => console.error('Failed to delete scheduler ' + this.redisPath));
    }
}

module.exports = {
    ScheduleHandler: ScheduleHandler
}