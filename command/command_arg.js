const processors = require('./command_arg_processors.js');

class CommandArgument {
    constructor(name, argObject, command) {
        this.name = name;
        this.command = command;
        this.type = argObject.type || 'string';
        this.description = argObject.description || 'N/A';
        this.permissions = argObject.permissions || [];
        this.checks = argObject.checks == null ? [] : [argObject.checks].flat();
        this.required = argObject.required == true;
        this.choices = [];

        if ('choices' in argObject) {
            if (Array.isArray(argObject.choices)) {
                for (const choice of argObject.choices) {
                    this.choices.push({ name: choice, value: choice });
                }
            }
            else {
                for (const [value, name] of Object.entries(argObject.choices)) {
                    this.choices.push({ name: name, value: value });
                }
            }
        }
    }

    isDefaultType() {
        switch(this.type) {
            case 'user':
            case 'member':
            case 'role':
            case 'channel':
            case 'mentionable':
            case 'integer':
            case 'number':
            case 'string':
            case 'boolean':
            case 'attachment':
                return true;
            default:
                return false;
        }
    }

    getDiscordAPIType() {
        switch(this.type) {
            case 'string':
                return 3;
            case 'integer':
                return 4;
            case 'boolean':
                return 5;
            case 'user':
            case 'member':
                return 6;
            case 'channel':
                return 7;
            case 'role':
                return 8;
            case 'mentionable':
                return 9;
            case 'number':
                return 10;
            case 'attachment':
                return 11;
            default:
                return 3;
        }
    }

    toDiscordAPI() {
        const obj = {
            name: this.name,
            description: this.description,
            type: this.getDiscordAPIType(),
            required: this.required,
            choices: this.choices
        };

        return obj;
    }

    async process(interaction) {
        const processor = processors[this.type] || processors['string'];
        const processedArgument = await processor(interaction, this.name);

        if (!interaction.member.permissions.has(this.permissions)) {
            throw `You do not have the permission to use the "${this.name}" argument.`;
        }

        for (const check of this.checks) {
            await check(interaction, processedArgument);
        }

        return processedArgument;
    }
}

module.exports = {
    CommandArgument: CommandArgument
}
