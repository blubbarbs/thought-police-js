const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    const target = args['target'];
    const reason = args['reason'];

    if (target.roles.cache.has(role.id)) {
        await interaction.reply({ content: `${target.displayName} already has this role!`, ephemeral: true });
        return;
    }

    await target.roles.add(role);
    await interaction.reply({ content: `${target.displayName} has been given the role.`, ephemeral: true });
    
    if (reason == null) {        
        if (target != interaction.member) {
            await client.announcementChannel.send(`${target} has been awarded the ${role.name} role by ${interaction.member}!`);
        }
        else {
            await client.announcementChannel.send(`${target} has been awarded the ${role.name}!`);
        }
    }
    else {        
        if (target != interaction.member) {
            await client.announcementChannel.send(`${target} has been awarded the ${role.name} role by ${interaction.member}!\n\`REASON: ${reason}\``);
        }
        else {
            await client.announcementChannel.send(`${target} has been awarded the ${role.name} role!\n\`REASON: ${reason}\``);
        }        
    }
}

module.exports = {
    description: 'Gives a specific role to someone.',
    args: {
        role: {
            type: 'role',
            description: 'The role you want to give.',
            optional: false
        },
        target: {
            type: 'member',
            description: 'The member that you want to give the role to.',
            optional: false
        },
        reason: {
            type: 'string',
            description: 'The reason the target is getting this role.',
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}