const { ServerSettings } = require('@data');

const MAX_MESSAGE_LENGTH = 2000;

async function execute(interaction) {
    let currentNumber = ServerSettings.get('a_num') || 1;
    let direction = ServerSettings.get('a_direction') || 1;

    await interaction.reply({ content: 'A'.repeat(currentNumber) });

    if (currentNumber == 1) {
        direction = 1;
    }
    else if (currentNumber == MAX_MESSAGE_LENGTH) {
        direction = -1;
    }

    currentNumber += direction;
    ServerSettings.set('a_num', currentNumber);
    ServerSettings.set('a_direction', direction);
}

module.exports = {
    description: 'A',
    execute: execute,
}