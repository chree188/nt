'use strict'

var RP = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.nickname = obj.nickname;
        this.rank = obj.rank;
        this.desc = obj.desc;
    }
};

RP.prototype = {
    toString: function () {
        return JSON.stringify(this)
    }
};

var RPGEN = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new RP(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

RPGEN.prototype = {
    init: function () {

    },

    save: function (nickname) {
        if (!nickname) {
            throw new Error("empty nickname")
        }

        if (nickname.length > 20) {
            throw new Error("the nickname is too long")
        }

        var from = Blockchain.transaction.from;
        var rp = this.data.get(nickname);
        if (rp) {
            throw new Error("rp has been occupied");
        }

        rp = new RP();
        rp.nickname = nickname;
        var random = Math.random();
        random *= 100;
        random = Math.round(random);
        rp.rank = random;
        if(random < 10){
            rp.desc = "你的rp最近烂爆了,快吃点东西补补吧";
        }else if(random < 30){
            rp.desc = "你的rp很低,不适合参与rp属性的行为";
        }else if(random < 50){
            rp.desc = "rp一般般";
        }else if(random < 80){
            rp.desc = "你有这样的人品很不错了";
        }else {
            rp.desc = "哇，你的人品报表了！";
        }
        this.data.put(nickname, rp);
        return rp;
    },

    get: function (nickname) {
        if (!nickname) {
            throw new Error("empty nickname")
        }
        return this.data.get(nickname);
    }
};

module.exports = RPGEN;