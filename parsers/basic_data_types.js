async function parseInteger(arg) {
    if (Number.isSafeInteger(arg)) {
        return +arg;
    }
    else {
        throw 'That is not a valid integer.';
    }
}

async function parseNumber(arg) {
    if (!isNaN(arg)) {
        return +arg;
    }
    else {
        throw 'That is not a valid number.';
    }
}

async function parseBoolean(arg) {
    arg = arg.toLowerCase();

    if (arg == 't' || arg == 'true' || arg == 'yes' || arg == 'y') {
        return true;
    }
    else if (arg == 'f' || arg == 'false' || arg == 'no' || arg == 'n') {
        return false;
    }
    else {
        throw `"${arg}" is not a proper boolean argument.`
    }
}

module.exports = {
    parseInteger: parseInteger,
    parseNumber: parseNumber,
    parseBoolean: parseBoolean
}