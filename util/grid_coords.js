const gridCoordinatesRegex = /([0-9]+|[A-Za-z]+)([0-9]+|[A-Za-z]+)?/;

function toAlphanumeric(x, y) {
    return `${String.fromCharCode(y + 65)}${x}`;
}

function toCoordinates(alphanumeric) {
    const match = alphanumeric.match(gridCoordinatesRegex);

    if (match == null) {
        return null;
    }
    else if (match[2] == undefined) {
        const leftMatch = match[1];

        if (isNaN(leftMatch)) {
            const y = leftMatch.toLowerCase().charCodeAt(0) - 97;

            return [null, y];
        }
        else {
            return [+leftMatch, null];
        }
    }
    else {
        const leftMatch = match[1];
        const rightMatch = match[2];

        const xStr = !isNaN(leftMatch) ? leftMatch : rightMatch;
        const yStr = !isNaN(leftMatch) ? rightMatch.toLowerCase() : leftMatch.toLowerCase();
        const x = +xStr;
        const y = yStr.charCodeAt(0) - 97;

        return [x, y];
    }
}

module.exports = {
    toAlphanumeric: toAlphanumeric,
    toCoordinates:toCoordinates
}