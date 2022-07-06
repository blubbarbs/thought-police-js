const numEmoji = {
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

const letterEmoji = {
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
    constructor(length, width) {
        this.grid = [];
        this.length = length;
        this.width = width;

        for (let y = 0; y < width; y++) {
            const row = [];

            for (let x = 0; x < length; x++) {
                row.push({ display: '🔲' });
            }

            this.grid.push(row);
        }
    }

    randomTile(predicate) {
        const tiles = [];

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                if (predicate == null || predicate(x, y)) {
                    tiles.push([x, y]);
                }                
            }
        }
        
        const randomIndex = Math.floor(Math.random() * tiles.length);

        return tiles[randomIndex];
    }

    get(x, y, key) {
        return this.grid[y][x]?.[key];
    }

    sets(x, y, data) {
        Object.assign(this.grid[y][x], data);
    }

    set(x, y, key, value) {
        const data = {};
        data[key] = value;

        this.sets(x, y, data);
    }

    clear() {
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.length; x++) {
                delete this.grid[y][x];
                
                this.grid[y][x] = { display: '🔲' };
            }
        }
    }

    getDisplayGrid() {
        const letterRow = ['❎'];
        const displayGrid = [letterRow];

        for (let x = 0; x < this.length; x++) {
            letterRow.push(numEmoji[x]);
        }

        for (let y = 0; y < this.width; y++) {
            let row = [];

            row.push(letterEmoji[y]);

            for (let x = 0; x < this.length; x++) {
                row.push(this.grid[y][x].display);
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
    Grid: Grid
}