"use strict";

var Guess = function () {
    LocalContractStorage.defineProperty(this, "nas");
};

Guess.prototype = {
    init: function () {
        this.nas = 0;
    },
    guess: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var result = Blockchain.transfer(from, value);

        if (!result) {
            throw new Error("transfer failed.");
        }
    },
    donate: function () {
        var value = Blockchain.transaction.value;
        this.nas += value;
    },
    value: function(){
        return this.nas;
    },
    test: function (address) {
        var result = Blockchain.transfer(address, 0.0001);
        if (!result) {
            throw new Error("transfer failed.");
        }
    }
};
module.exports = Guess;