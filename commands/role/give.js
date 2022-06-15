const { Permissions } = require('discord.js');

async function execute(interaction, args) {
    const client = interaction.client;
    const role = args['role'];
    const reason = args['reason'];
    const targets = [args['target'], args['target2'], args['target3'], args['target4'], args['target5'], args['target6'], args['target7']].filter(target => target != null);

    let announcement = '';

    for (target of targets) {
        await target.roles.add(role);
    }

    if (targets.length == 1) {
        const target = targets[0];
        await interaction.reply({ content: `${target.displayName} has been given the role.`, ephemeral: true });

        if (target != interaction.member) {
            announcement += `${target} has been awarded the ${role.name} role by ${interaction.member}!`;
        }
        else {
            announcement += `${target} has been awarded the ${role.name} role!`;
        }
    }
    else if (targets.length == 2) {
        const target1 = targets[0];
        const target2 = targets[1];

        await interaction.reply({ content: `${target1.displayName} and ${target2.displayName} have been given the role.`, ephemeral: true });
        announcement += `${target1} and ${target2} have been awarded the ${role.name} role by ${interaction.member}!`;
    }
    else {
        const finalTarget = targets.pop();

        await interaction.reply({ content: `The listed users have been given the role.`, ephemeral: true });
        announcement += `${targets.join(', ')}, and ${finalTarget} have been awarded the ${role.name} role by ${interaction.member}!`;
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
            optional: false
        },
        reason: {
            type: 'string',
            description: 'The reason the target is getting this role.',
            optional: false
        },        
        target: {
            type: 'member',
            description: 'A member that you want to give the role to.',
            optional: false
        },
        target2: {
            type: 'member',
            description: 'A member that you want to give the role to.'
        },
        target3: {
            type: 'member',
            description: 'A member that you want to give the role to.'
        },
        target4: {
            type: 'member',
            description: 'A member that you want to give the role to.'
        },
        target5: {
            type: 'member',
            description: 'A member that you want to give the role to.'
        },
        target6: {
            type: 'member',
            description: 'A member that you want to give the role to.'
        },
        target7: {
            type: 'member',
            description: 'A member that you want to give the role to.'
        },
        target8: {
            type: 'member',
            description: 'A member that you want to give the role to.'
        }
    },
    permissions: Permissions.FLAGS.ADMINISTRATOR,
    execute: execute
}