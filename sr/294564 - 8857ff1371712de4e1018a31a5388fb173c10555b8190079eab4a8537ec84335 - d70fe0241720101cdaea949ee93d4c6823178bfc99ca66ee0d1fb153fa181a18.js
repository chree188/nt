"use strict";

var Guess = function () {
    LocalContractStorage.defineProperty(this, "balance");
    LocalContractStorage.defineProperty(this, "donateRecords");
    LocalContractStorage.defineProperty(this, "guessRecords");
    // LocalContractStorage.defineMapProperty(this, "donateRecord");
};

Guess.prototype = {
    init: function () {
        this.balance = 0;
        this.donateRecords = [];
        this.guessRecords = [];
    },
    guess: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value == 0) {
            throw new Error('竞猜金额不能等于0！');
        }
        var balance = this.balance;
        var guessNum = parseInt((value + '').substr((value + '').length - 1, 1));
        var target = Math.floor(Math.random() * 9 + 1);

        if(guessNum === target){

        }else{
            value = new BigNumber(value);
            this.balance = value.plus(balance);
        }

        var guessRecords = this.guessRecords;
        var guessRecord = {
            'from': from,
            'value': value,
            'tn': target,
            'gn': guessNum,
            'ts': new Date().getTime()
        }
        guessRecords.push(guessRecord);
        this.guessRecords = guessRecords;
    },
    donate: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value == 0) {
            throw new Error('捐献金额不能等于0！');
        }
        value = new BigNumber(value);
        this.balance = value.plus(this.balance);

        var donateRecords = this.donateRecords;
        var donateRecord = {
            'from': from,
            'value': value,
            'ts': new Date().getTime()
        }
        donateRecords.push(donateRecord);
        this.donateRecords = donateRecords;
    },
    getBalance: function () {
        return this.balance;
    },
    getDonateRecords: function () {
        return this.donateRecords;
    },
    getGuessRecords: function () {
        return this.guessRecords;
    }
};
module.exports = Guess;