'use strict'

/*
var FlappyBirdData = function () {
    if(args) {
        var data = JSON.parse(args);
        this.score = new BigNumber(data.score);
    }
};

FlappyBirdData.prototype = {
    toString : function () {
        return JSON.stringify(this);
    }
};*/

var FlappyBird = function () {
    LocalContractStorage.defineMapProperty(this, "data");
};

FlappyBird.prototype = {
    init:function () {

    },

    queryScore : function () {
        var from = Blockchain.transaction.from;
        return this.data.get(from);
    },

    updateScore : function (_score) {
        if(!_score) {
            throw new Error("Invalid score data")
        }

        var from = Blockchain.transaction.from;
        var hightestScore = this.data.get(from);
        var score = new BigNumber(_score);

        if (hightestScore === null || score > hightestScore){
            this.data.set(from,score);
        }
    }
}

module.exports = FlappyBird;

