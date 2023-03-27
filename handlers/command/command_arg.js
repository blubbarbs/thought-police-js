const ArgTypes = require('@command-arg-types')

class CommandArgument {
    constructor(name, argObject, command) {
        this.name = name;
        this.command = command;
        this.type = argObject.type || ArgTypes.STRING;
        this.description = argObject.description || 'N/A';
        this.permissions = argObject.permissions || [];
        this.num = argObject.num || 1;
        this.checks = argObject.checks || [];
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

    toDiscordAPI() {
        const obj = {
            name: this.name,
            description: this.description,
            type: this.num == 1 ? this.type.discordAPIType : ArgTypes.STRING.discordAPIType,
            required: this.required,
            choices: this.choices
        };

        return obj;
    }

    toJSON() {
        return this.toDiscordAPI();
    }

    async process(interaction) {
        if (!interaction.member.permissions.has(this.permissions)) {
            throw `You do not have the permission to use the "${this.name}" argument.`;
        }

        if (this.num == 1) {
            const processedArg = await this.type.processSingle(interaction, this.name);

            for (const check of this.checks) {
                await check(interaction, processedArg);
            }

            return processedArg;
        }
        else {
            const processedArgs = await this.type.processList(interaction, this.name);

            for (const processedArg of processedArgs) {
                for (const check of this.checks) {
                    await check(interaction, processedArg);
                }
            }

            return processedArgs;
        }
    }
}

module.exports = {
    CommandArgument: CommandArgument
}
