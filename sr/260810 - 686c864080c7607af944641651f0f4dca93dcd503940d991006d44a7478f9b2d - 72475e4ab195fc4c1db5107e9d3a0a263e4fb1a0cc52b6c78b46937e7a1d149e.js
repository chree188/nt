"use strict";

var ScoreContract = function () {
    LocalContractStorage.defineMapProperty(this, "sortMap");
    LocalContractStorage.defineProperty(this, "sortRank");
};

ScoreContract.prototype = {
    init: function () {
        this.sortRank = [];
    },

    setScore: function (name, score) {
        this.sortMap.set(name, score);
        this._insertScore(name, score);
        return this._genUserScore(name, score);
    },

    getScore: function (name) {
        var result = this.sortMap.get(name);
        return result ? result : 0;
    },

    getRank: function () {
        return this.sortRank;
    },

    _genUserScore: function (name, score) {
        return {
            name: name,
            score: score
        };
    },

    _insertScore: function (name, score) {
        var scoreSort = this.sortRank;
        var tempName = name;
        if (scoreSort instanceof Array) {
            for (var i = 0; i < scoreSort.length; i++) {
                if (scoreSort[i].name === name) {
                    scoreSort[i].score = score;
                    tempName = null;
                    break;
                }
            }

            if (tempName) {
                scoreSort[scoreSort.length] = this._genUserScore(name, score);
            }

            scoreSort.sort(function (a, b) {
                return parseInt(a.score) < parseInt(b.score);
            });

            this.sortRank = scoreSort.slice(0, 10);
        }
    }


};

module.exports = ScoreContract;
