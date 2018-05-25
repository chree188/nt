"use strict";

var Tetris = function () {
    LocalContractStorage.defineMapProperty(this,"tetris");
};

Tetris.prototype = {
    init:function () {
    },
    save:function (score) {
        var player = Blockchain.transaction.from;
        var orig_score = this.tetris.get(player);
        if(score>orig_score )
            this.tetris.set(player,score);
    },

    get: function (player) {
        var score = this.tetris.get(player);
        return  "玩家 "+player +" 最高得分为： "+score +" 分";
    }

};

module.exports = Tetris;