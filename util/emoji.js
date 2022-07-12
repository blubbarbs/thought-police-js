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

function getNumberEmoji(num) {
    return NUM_EMOJI[num];
}

function getLetterEmoji(num) {
    return LETTER_EMOJI[num];
}

module.exports = {
    getNumberEmoji: getNumberEmoji,
    getLetterEmoji: getLetterEmoji
}