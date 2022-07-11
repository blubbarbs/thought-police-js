const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const treasureHunt = interaction.client.treasureHunt;
    const minutesTillDaily = treasureHunt.getMinutesTillNextDig(interaction.member.id);
    const freeDigs = treasureHunt.getFreeDigs(interaction.member.id);

    await interaction.reply({ content: `**${Math.floor(minutesTillDaily / 60)} hour(s)** and **${minutesTillDaily % 60} minute(s)** till next dig\n**${freeDigs}** free digs remaining`, ephemeral: true });
}

module.exports = {
    description: 'Check on the time until your next dig and the amount of free digs you have.',
    execute: execute
}