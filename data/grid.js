const { Data2L } = require("./double_layer_data");
const { getLetterEmoji, getNumberEmoji } = require("../util/emoji.js");

class Grid extends Data2L {
    constructor(key, database, length, width, defaultDisplay) {
        super(key, database);
        
        this.length = length;
        this.width = width;
        this.defaultDisplay = defaultDisplay || '🔲';
    }

    get(x, y, key) {
        return super.get(`${x},${y}`, key);
    }

    getDisplay(x, y) {
        return this.get(x, y, 'display') || this.defaultDisplay;
    }

    set(x, y, key, value) {
        super.set(`${x},${y}`, key, value);
    }

    setDisplay(x, y, display) {
        this.set(x, y, 'display', display);
    }

    has(x, y, key) {
        return super.has(`${x},${y}`, key);
    }

    toString() {
        let str = '❎';

        for (let x = 0; x < this.width; x++) {
            str += getNumberEmoji(x);
        }

        str += '\n';

        for (let y = 0; y < this.width; y++) {
            str += getLetterEmoji(y);

            for (let x = 0; x < this.length; x++) {
                const display = this.getDisplay(x, y);

                str += display;
            }
            
            str += '\n';
        }
    
        return str;
    }
}

module.exports = {
    Grid: Grid
}