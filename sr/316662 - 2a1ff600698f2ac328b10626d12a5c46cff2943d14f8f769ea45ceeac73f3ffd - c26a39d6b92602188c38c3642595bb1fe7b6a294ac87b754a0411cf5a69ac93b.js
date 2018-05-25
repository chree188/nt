"use strict";
var RecordItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.difficulty = obj.difficulty;
        this.score = obj.score;
    } else {
        this.difficulty = "0";
        this.score = "0";
    }
};

RecordItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var GameRecord = function () {
    LocalContractStorage.defineMapProperty(this, "gamerecord", {
        parse: function (text) {
            return new RecordItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

GameRecord.prototype = {
    init: function () {},

    updateScore: function (difficulty, score) {
        difficulty = difficulty.trim();
        score = score.trim();
        if (difficulty === "" || score === ""){
            throw new Error("bad input, empty difficulty or score");
        }

        if (difficulty !== "1" && difficulty !== "2" && difficulty !== "4") {
            throw new Error("bad input, bad difficulty type");
        }

        var from = Blockchain.transaction.from;
        var recordItem = this.gamerecord.get(from);

        if (recordItem) {
            var oldscore = parseInt(recordItem.score) * parseInt(recordItem.difficulty)
            var newscore = parseInt(score) * parseInt(difficulty)

            if (oldscore > newscore) {
                throw new Error("not best score, donot need to update score");
            }
        }

        var recordItem2 = new RecordItem();
        recordItem2.difficulty = difficulty;
        recordItem2.score = score;

        this.gamerecord.put(from, recordItem2);
    },

    getScore: function () {
        var from = Blockchain.transaction.from;
        return this.gamerecord.get(from);
    }
};
module.exports = GameRecord;