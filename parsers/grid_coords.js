const { toCoordinates, toAlphanumeric } = require("@util/grid_coords.js");

async function parseGridCoordinates(arg) {
    const coords = toCoordinates(arg);

    if (coords == null) {
        throw 'Those are not valid coordinates. Valid coordinates look like "A1" or "1A".';
    }
    else if (coords[0] == null) {
        throw 'You must input a number for the coordinates to be valid.'
    }
    else if (coords[1] == null) {
        throw 'You must input a letter for the coordinates to be valid.'
    }
    else {
        return toAlphanumeric(...coords);
    }
}

module.exports = {
    parseGridCoordinates: parseGridCoordinates
}