const { Permissions } = require('discord.js');
const hexRegex = /#[0-9A-Fa-f]{6}/;

const ROLE_OFFSET = 7;

async function colorMember(member, hexColor) {
    await decolorMember(member);
    const colorRole = await makeColorRole(member.guild, hexColor);
    await member.roles.add(colorRole);
}

async function decolorMember(member) {
	const colorRole = member.roles.color;

	if(colorRole == null || (colorRole.name.match(hexRegex) == null && colorRole.name != 'Greener')) {
		return;
	}
	else {
        await member.roles.remove(colorRole);
	}
}

async function makeColorRole(guild, hexColor) {
	const roles = Array.from(guild.roles.cache.values());
    
    for (const role of guild.roles.cache.values()) {
		if(role.name == hexColor) {
			return role;
		}
	}
	
    const newRoleData = {
		data: {
			name: hexColor,
			color: hexColor,
		}
    };
    
    const role = await guild.roles.create(newRoleData);
    role.setPosition(roles.length - ROLE_OFFSET);
    return role;
}

async function execute(interaction, args) {
    const color = args['color'];
    const target = args['target'] != null ? args['target'] : interaction.member;
    const match = color.match(hexRegex);
    
    if (match != null) {
        await colorMember(target, color);
        await interaction.reply({ content: `Colored.`, ephemeral: true });
    }
    else {
        await interaction.reply({ content: 'That is not a valid hex color. A valid hex color looks like this: "#A123CD"', ephemeral: true });
    }

    console.log(`Color: ${color} Target: ${target}`);
}

module.exports = {
    name: 'color',
    description: 'Changes the color of your name to a given hex color.',
    args: {
        color: {
            type: 'string',
            description: "Hex color you want to change to.",
            optional: false
        },
        target: {
            type: 'member',
            description: "Member whose color you want to change.",
            permissions: Permissions.FLAGS.MODERATE_MEMBERS
        }
    },
    execute: execute
}