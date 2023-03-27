const { Permissions } = require('discord.js');
const { getGuild } = require('@bot');
const { assert } = require('@util/checks');
const ArgTypes = require('@command-arg-types');

const hexRegex = /#[0-9A-Fa-f]{6}/;

const ROLE_OFFSET = 7;

async function colorMember(member, hexColor) {
    await decolorMember(member);
    const colorRole = await makeColorRole(hexColor);
    await member.roles.add(colorRole);
}

async function decolorMember(member) {
	const colorRole = member.roles.color;

	if (colorRole == null || (colorRole.name.match(hexRegex) == null && colorRole.name != 'Greener')) {
        return;
	}
	else {
        await member.roles.remove(colorRole);
	}
}

async function makeColorRole(hexColor) {
    const guild = await getGuild();
	const roles = Array.from(guild.roles.cache.values());

    for (const role of guild.roles.cache.values()) {
		if(role.name == hexColor) {
			return role;
		}
	}

    const newRoleData = {
		name: hexColor,
		color: hexColor,
        position: roles.length - ROLE_OFFSET
    };

    const role = await guild.roles.create(newRoleData);

    return role;
}

async function execute(interaction, args) {
    const color = args['color'];
    const target = args['target'] || interaction.member;

    await colorMember(target, color);
    await interaction.reply({ content: `Colored.`, ephemeral: true });
}

module.exports = {
    description: 'Changes the color of your name to a given hex color.',
    args: {
        color: {
            type: ArgTypes.STRING,
            description: "Hex color you want to change to.",
            required: true,
            checks: [assert((_, arg) => arg.match(hexRegex) != null, 'That is not a valid color hex.')]
        },
        target: {
            type: ArgTypes.MEMBER,
            description: "Member whose color you want to change.",
            permissions: Permissions.FLAGS.MODERATE_MEMBERS
        }
    },
    execute: execute
}