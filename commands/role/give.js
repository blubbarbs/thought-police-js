const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    const reason = args['reason'];
    const targets = args['targets'];

    let announcement = '';

    for (const target of targets) {
        await target.roles.add(role);
    }

    if (targets.length == 1) {
        const target = targets[0];
        await interaction.reply({ content: `${target} has been given the role.`, ephemeral: true });

        if (target != interaction.member) {
            announcement += `${target} has been awarded the ${role} role by ${interaction.member}!`;
        }
        else {
            announcement += `${target} has been awarded the ${role} role!`;
        }
    }
    else if (targets.length == 2) {
        const target1 = targets[0];
        const target2 = targets[1];

        await interaction.reply({ content: `${target1} and ${target2} have been given the role.`, ephemeral: true });
        announcement += `${target1} and ${target2} have been awarded the ${role} role by ${interaction.member}!`;
    }
    else {
        const finalTarget = targets.pop();

        await interaction.reply({ content: `The listed users have been given the role.`, ephemeral: true });
        announcement += `${targets.join(', ')}, and ${finalTarget} have been awarded the ${role} role by ${interaction.member}!`;
    }

    announcement += `\n\n\`REASON: ${reason}\``;

    await client.announcementChannel.send(announcement);
}

module.exports = {
    description: 'Gives a specific role to someone.',
    args: {
        role: {
            type: 'role',
            description: 'The role you want to give.',
            required: true
        },
        targets: {
            type: 'member_list',
            description: 'The members you want to give the role to.',
            required: true
        },
        reason: {
            type: 'string',
            description: 'The reason the target(s) are getting this role.',
            required: true
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}