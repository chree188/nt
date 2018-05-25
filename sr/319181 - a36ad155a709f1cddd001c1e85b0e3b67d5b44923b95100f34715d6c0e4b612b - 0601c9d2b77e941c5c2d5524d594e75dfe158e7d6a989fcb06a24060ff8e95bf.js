/**
 * Created by linzhihong on 2018/5/24.
 */
'use strict';

var GameItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.day = obj.day;
        this.score = obj.score;
        this.layer = obj.layer;
        this.name = obj.name;
        this.from = obj.from;
    } else {
        this.day = "";
        this.name = "";
        this.from = "";
        this.score = 0;
        this.layer = 0;
    }
};


GameItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var RankingContract = function () {

    LocalContractStorage.defineMapProperty(this, 'GailouRankingDB', {

        parse: function (str) {
            return new GameItem(str);
        },

        stringify: function (o) {
            return o.toString();
        }
    });
};


RankingContract.prototype = {

    init: function () {

    },
    
    rankIn:function (name,score,layer,day) {
        day = day.trim();
        score = score.trim()
        layer = layer.trim();
        name = name.trim();

        var from = Blockchain.transaction.from;
        var rankItem = this.GailouRankingDB.get(from)
        if (!rankItem) {
            rankItem = new GameItem(null)
        }

        //更新该账户分数信息
        if (score > rankItem.score) {
            rankItem.score = score;
            rankItem.day = day;
            rankItem.name = name;
            rankItem.layer = layer;
            rankItem.from = from;
            this.GailouRankingDB.put(from, rankItem);
        }
    },
    
    getRankInf:function () {
        var from = Blockchain.transaction.from;
        var rankItem = this.GailouRankingDB.get(from)
        if (!rankItem) {
            rankItem = new GameItem(null)
        }
        return rankItem? rankItem.toString():'';
    }
}

module.exports = RankingContract;