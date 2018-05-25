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
        var guessNum = parseInt((value + '').substr((value + '').length - 1, 1));
        var target = Math.floor(Math.random() * 9 + 1);
        
        if(guessNum === target){
            
        }else{
            value = new BigNumber(value);
            this.balance = this.balance.plus(value);
        }
        
        var guessRecord = {
            'from': from,
            'value': value,
            'tn': target,
            'gn': guessNum,
            'ts': new Date().getTime()
        }
        
        this.guessRecords.push(guessRecord);
    },
    donate: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value == 0) {
            throw new Error('捐献金额不能等于0！');
        }
        value = new BigNumber(value);
        this.balance = this.balance.plus(value);

        var donateRecord = {
            'from': from,
            'value': value,
            'ts': new Date().getTime()
        }
        this.donateRecords.push(donateRecord);
    },
    value: function () {
        return this.balance;
    }
};
module.exports = Guess;