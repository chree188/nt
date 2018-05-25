"use strict";

var DiceRecord = function(text) {
    if(text) {
        var obj = JSON.parse(text);
        this.address = obj.address;
        this.betrecord = obj.betrecord;
    } else {
        this.address = "";
        this.betrecord = [];
    }
}

DiceRecord.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BetResult = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DiceRecord(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BetResult.prototype = {
    init: function () {
        // todo
    },

    save: function (bet, sum, result) {
        var from = Blockchain.transaction.from;
        var diceItem = {"bet": bet, "sum": sum, "result": result};

        var betResult = this.repo.get(from);
        if (betResult){
            if(betResult.betrecord) {
                betResult.betrecord.push(diceItem);
            }
        } else {
            betResult = new BetResult();
            betResult.address = from;
            betResult.betrecord = [];
            betResult.betrecord.push(diceItem);
            this.repo.put(from, betResult);
        } 
    },

    get: function (from) {
        from = from.trim();
        if ( from === "" ) {
            throw new Error("empty address")
        }
        return JSON.stringify(this.repo.get(from));
    }
};
module.exports = BetResult;