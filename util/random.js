const gaussian = require('gaussian');

function randomInt(max, min) {
    min = min != null ? min : 0;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGaussian(mean, variance) {
    return gaussian(mean, variance).random(1)[0];
}

function roll(probability) {
    return Math.random() < probability;
}


module.exports = {
    randomInt: randomInt,
    randomGaussian: randomGaussian,
    roll: roll
}
