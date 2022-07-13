function randomInt(max, min) {
    min = min != null ? min : 0;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roll(probability) {
    return Math.random() < probability;
}

module.exports = {
    randomInt: randomInt,
    roll: roll
}
