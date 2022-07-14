function assert(condition, errorMessage) {
    const check = async function (interaction, args) {
        const result = await condition(interaction, args);

        if (!result) throw errorMessage;
    };

    return check;
}

module.exports = {
    assert: assert
}