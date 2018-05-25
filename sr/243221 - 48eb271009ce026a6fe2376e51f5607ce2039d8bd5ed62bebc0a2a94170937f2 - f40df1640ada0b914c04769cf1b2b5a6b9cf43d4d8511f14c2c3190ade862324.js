"use strict";

var Snake = function () {
  LocalContractStorage.defineMapProperty(this,"snake");
};

Snake.prototype = {
    init:function () {
    },

    begin: function () {
        var player = Blockchain.transaction.from;
        this.snake.set(player,0);
    },
    save:function (score) {
        var player = Blockchain.transaction.from;
        var orig_score = this.snake.get(player);
        if(score>orig_score )
            this.snake.set(player,score);
    },

    get: function (player) {
        var score = this.snake.get(player);
        return  "玩家 "+player +" 最高得分为： "+score +" 分";
    }

};

module.exports = Snake;