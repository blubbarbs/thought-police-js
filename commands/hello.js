const { Permissions } = require('discord.js');
const { ScheduleHandler } = require('@handlers');
const { client } = require('@bot');

const HelloScheduler = ScheduleHandler.scheduler('hello_command', sayHello);

async function sayHello(data) {
    const userID = await client.users.fetch(data['userID']);
    const text = data['text'];
    const dmChannel = await userID.createDM(true);

    await dmChannel.send(text);
}

async function execute(interaction, args) {
    const text = args['text'];
    const time = args['time'];

    HelloScheduler.schedule({ userID: interaction.member.id, text: text }, time * 1000, interaction.member.id);
    await interaction.reply({ content: `Scheduled for ${time} seconds.`, ephemeral: true });
}

module.exports = {
    description: 'Sends a command back to the user after a fixed number of seconds.',
    args: {
        text: {
            type: 'string',
            description: 'Text to display back to the user.',
            required: true
        },
        time: {
            type: 'integer',
            description: 'Time (in seconds) to display message.',
            required: true
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute,
}