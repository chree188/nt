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
        balance = new BigNumber(balance);
        balance = balance.plus(value);

        var gn = (value + '').replace(new RegExp('0', 'gm'), '');
        gn = gn.substr(gn.length - 1, 1);
        var target = Math.floor(Math.random() * 9 + 1);

        var guessRecord = {
            'from': from,
            'value': value,
            'tn': target,
            'gn': gn,
            'ts': new Date().getTime()
        }

        if(gn === target){
            var reward = new BigNumber(value * 8);
            var result = Blockchain.transfer(from, reward);
            guessRecord.result = result;
            if(result){
                balance = balance.sub(reward);
            }
        }

        guessRecord.balance = balance;
        
        this.balance = balance;

        var guessRecords = this.guessRecords;
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
            'ts': new Date().getTime(),
            'balance': this.balance
        }
        donateRecords.push(donateRecord);
        this.donateRecords = donateRecords;
    },
    getBalance: function () {
        return this.balance;
    },
    getDonateRecords: function () {
        //todo 分页获取
        return this.donateRecords;
    },
    getGuessRecords: function () {
        //todo 分页获取
        return this.guessRecords;
    }
};
module.exports = Guess;