const checkCommand = require('./check.js');

async function execute(interaction) {
    await checkCommand.execute(interaction, { target: interaction.member });
}

module.exports = {
    description: 'Commands related to the points system on the Discord.',
    execute: execute
}