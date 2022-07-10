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

class Grid {
    constructor(length, width, defaultTileDisplay) {
        this.grid = [];
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

    sets(x, y, data) {
        Object.assign(this.grid[y][x], data);
    }

    set(x, y, key, value) {
        this.grid[y][x][key] = value;
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
}

module.exports = {
    Grid: Grid,
    toAlphanumeric: toAlphanumeric,
    toCoordinates: toCoordinates
}