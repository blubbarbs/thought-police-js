const { Game } = require('./game/game');

const GAME_NAME = 'roulette';

class RouletteGame extends Game {
    constructor(redis) {
        super(GAME_NAME, redis);
    }

}