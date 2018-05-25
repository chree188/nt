"use strict";

var GoodsItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.date=obj.date;
        this.link=obj.link;
        this.author = obj.author;
    } else {
        this.key = "";
        this.author = "";
        this.value = "";
        this.date="";
        this.link="";
    }
};

GoodsItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Goods = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new GoodsItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Goods.prototype = {
    init: function () {
    },

    save: function (key, value,link,date) {
        var from = Blockchain.transaction.from;
        var goodsItem = this.repo.get(key);
        if (goodsItem) {
            //throw new Error("value has been occupied");
            goodsItem.value = JSON.parse(goodsItem).value + '|-' + value;
            goodsItem.author = JSON.parse(goodsItem).author + '|-' +from;
            goodsItem.link=JSON.parse(goodsItem).link + '|-' +link;
            goodsItem.date=JSON.parse(goodsItem).date + '|-' +date;
            this.repo.put(key, goodsItem);

        } else {
            goodsItem = new GoodsItem();
            goodsItem.author = from;
            goodsItem.key = key;
            goodsItem.value = value;
            goodsItem.link=link;
            goodsItem.date=date;
            this.repo.put(key, goodsItem);
        }
    },

    get: function (key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = Goods;