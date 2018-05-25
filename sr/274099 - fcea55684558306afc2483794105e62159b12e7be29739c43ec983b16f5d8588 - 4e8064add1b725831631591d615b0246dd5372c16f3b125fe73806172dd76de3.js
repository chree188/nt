"use strict"

var GuessNumber = function () {
}

GuessNumber.prototype = {
    init: function () {
        // todo
    },
    guess: function(num) {
        if (num <1 || num > 6) {
            throw new Error("input num must between 1~6")
        }

        return Math.floor(Math.random()*6+1);
    },
}
module.exports = GuessNumber
