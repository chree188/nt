"use strict";

//该智能合约的目的主要用于任意游戏的玩家的高分记录,当下还有不少游戏的
//最高分记录无法被认证，需要长达几个小时的视频才可以确认
//可以依次



//player记录下该玩家在哪个时刻玩哪个游戏达成的最高分.
var Player = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.player = obj.player;
        this.game = obj.game;
        this.score = obj.score;
        this.createTime = obj.createTime;
    } else {
        this.player = "";
        this.game = "";
        this.score = "";
        this.createTime = "";
    }
};

Player.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Player(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperDictionary.prototype = {
    init: function () {
        // todo
    },

    save: function (player, game, score) {

        player = player.trim();
        game = game.trim();

        var key = player + game;

        if (key === "" || score === ""){
            throw new Error("存储数据出错");
        }
        if (score.length > 64 || key.length > 64){
            throw new Error("数据过长，出错")
        }

        var from = Blockchain.transaction.from;
        var queryPlayer = this.repo.get(key);
        if (queryPlayer){
            //下面这里一定要字符串转数字
            if(   parseInt(queryPlayer.score) > parseInt(score) ){
                throw new Error("该分数并未达到该玩家的最高分，历史最高分："+queryPlayer.score +",本次得分："+score);
            }
        }

        var playerObj = new Player();
        playerObj.author = from;
        playerObj.player = player;
        playerObj.game = game;
        playerObj.score = score;
        playerObj.createTime = Date.parse(new Date());

        this.repo.put(key, playerObj);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = SuperDictionary;