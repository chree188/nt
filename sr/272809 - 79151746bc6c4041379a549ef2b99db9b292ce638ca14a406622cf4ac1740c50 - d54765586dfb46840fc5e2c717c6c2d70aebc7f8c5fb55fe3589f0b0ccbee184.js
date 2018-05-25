'use strict';

var SampleContract = function () {
};

SampleContract.prototype = {
    init: function () {
    },
    set: function (bestScore) {
        // 存储字符串
        LocalContractStorage.set("bestScore",bestScore);

    },
    get: function () {
        var bestScore = LocalContractStorage.get("bestScore");
        return bestScore;
    },

};

module.exports = SampleContract;


