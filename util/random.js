function randomInt(max, min) {
    min = min != null ? min : 0;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roll(probability) {
    return Math.random() < probability;
}

function randomTiles(grid, amount, predicate) {
    const tilePool = [];

    for (let y = 0; y < grid.width; y++) {
        for (let x = 0; x < grid.length; x++) {
            if (predicate == null || predicate(x, y)) {                    
                tilePool.push([x, y]);
            }                
        }
    }
    
    const tiles = [];

    for (let i = 0; i < amount; i++) {
        const randomIndex = randomInt(tilePool.length - 1);
        const tile = tilePool.splice(randomIndex, 1);

        tiles.push(tile[0]);
    }

    return tiles;
}

function randomTile(grid, predicate) {
    return randomTiles(grid, 1, predicate)[0];
}

module.exports = {
    randomInt: randomInt,
    randomTiles: randomTiles,
    randomTile: randomTile,
    roll: roll
}
