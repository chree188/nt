"use strict";

var Bottle = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
        this.submitTime = obj.submitTime;
    } else {
        this.id = 0;
        this.title = "";
        this.content = "";
        this.author = "";
        this.submitTime = "";
    }
};

Bottle.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BottleContract = function () {
    LocalContractStorage.defineMapProperty(this, "bottles", {
        parse: function (text) {
            return new Bottle(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "currentBottleId");
};

BottleContract.prototype = {
    init: function () {
        this.currentBottleId = 0;
    },

    getRandomBottle: function () {
        var result;
        //根据已有漂流瓶的数量，产生一个随机数，返回一个
        var random = parseInt(Math.random()*this.currentBottleId);
        result = this.bottles.get(0);
        return result;
    },

    newBottle: function (title, content, author) {
        var bottleId = this.currentBottleId;
        this.currentBottleId = bottleId + 1;
        var submitTime = Blockchain.block.timestamp;

        var bottle = new Bottle();
        bottle.id = bottleId;
        bottle.title = title;
        bottle.content = content;
        bottle.author = author;
        bottle.submitTime = submitTime;
        this.bottles.put(bottleId, bottle);

        return bottleId;
    },

};
module.exports = BottleContract;