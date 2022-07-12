const { randomInt } = require('../util/funcs.js');

const NUM_EMOJI = {
    0: '0️⃣',
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣',
    10: '🔟',
    11: '⏸️'
}

const LETTER_EMOJI = {
    0: '🇦',
    1: '🇧',
    2: '🇨',
    3: '🇩',
    4: '🇪',
    5: '🇫',
    6: '🇬',
    7: '🇭',
    8: '🇮',
    9: '🇯',
    10: '🇰',
    11: '🇱'
}

class Grid {
    constructor(key, database, length, width, defaultTileDisplay) {
        this.grid = [];
        this.key = key;
        this.database = database;
        this.length = length;
        this.width = width;
        this.defaultTileDisplay = defaultTileDisplay == null ? '🔲' : defaultTileDisplay;
    
        for (let y = 0; y < width; y++) {
            const row = [];

            for (let x = 0; x < length; x++) {
                row.push({});
            }

            this.grid.push(row);
        }
    }

    get(x, y, key) {
        return this.grid[y][x]?.[key];
    }

    getDisplay(x, y) {
        return this.get(x, y, 'display') || this.defaultTileDisplay;
    }

    sets(x, y, data) {
        Object.assign(this.grid[y][x], data);
    }

    set(x, y, key, value) {
        this.grid[y][x][key] = value;
    }

    setDisplay(x, y, display) {
        this.set(x, y, 'display', display);
    }

    resetDisplay(x, y) {
        this.delete(x, y, 'display');
    }

    delete(x, y, key) {
        if (key == null) {
            delete this.grid.grid[y][x];

            this.grid[y][x] = {};
        }
        else {
            delete this.grid.grid[y][x][key];
        }
    }

    clear() {
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                delete this.grid[y][x];
                
                this.grid[y][x] = {};
            }
        }
    }

    randomTiles(amount, predicate) {
        amount = amount != null ? amount : 1;
        const tilePool = [];

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                if (predicate == null || predicate(x, y, this.get(x, y))) {                    
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

    randomTile(predicate) {
        return this.randomTiles(1, predicate)[0];
    }

    getDisplayGrid() {
        const letterRow = ['❎'];
        const displayGrid = [letterRow];

        for (let x = 0; x < this.length; x++) {
            letterRow.push(NUM_EMOJI[x]);
        }

        for (let y = 0; y < this.width; y++) {
            let row = [];

            row.push(LETTER_EMOJI[y]);

            for (let x = 0; x < this.length; x++) {
                const display = 'display' in this.grid[y][x] ? this.grid[y][x].display : this.defaultTileDisplay;
                
                row.push(display);
            }

            displayGrid.push(row);
        }

        return displayGrid;
    }

    toString() {
        let strArray = [];
        const displayGrid = this.getDisplayGrid();

        for (const row of displayGrid) {
            strArray.push(row.join(''));
        }

        return strArray.join('\n');
    }

    async save() {
        await this.database.set(this.key, { grid: this.grid, defaultTileDisplay: this.defaultTileDisplay });
    }

    async load() {
        const data = await this.database.get(this.key);

        if (data != null) {
            this.grid = data.grid;
            this.defaultTileDisplay = data.defaultTileDisplay;    
        }
    }
}

module.exports = {
    Grid: Grid
}