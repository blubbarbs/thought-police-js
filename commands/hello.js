const { Permissions } = require('discord.js');
const { ScheduleHandler } = require('@handlers');
const { client } = require('@bot');
const ArgTypes = require('@command-arg-types');

const HelloScheduler = ScheduleHandler.registerScheduler('hello_command', sayHello);

async function sayHello(data) {
    const user = await client.users.fetch(data['userID']);
    const text = data['text'];
    const dmChannel = await user.createDM(true);

    await dmChannel.send(text);
}

async function execute(interaction, args) {
    const text = args['text'];
    const time = args['time'];

    HelloScheduler.schedule({ userID: interaction.member.id, text: text }, time * 1000, interaction.member.id);
    await interaction.reply({ content: `Scheduled for ${time} second(s).`, ephemeral: true });
}

module.exports = {
    description: 'Sends a command back to the user after a fixed number of seconds.',
    args: {
        text: {
            type: ArgTypes.STRING,
            description: 'Text to display back to the user.',
            required: true
        },
        time: {
            type: ArgTypes.INTEGER,
            description: 'Time (in seconds) to display message.',
            required: true
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute,
}