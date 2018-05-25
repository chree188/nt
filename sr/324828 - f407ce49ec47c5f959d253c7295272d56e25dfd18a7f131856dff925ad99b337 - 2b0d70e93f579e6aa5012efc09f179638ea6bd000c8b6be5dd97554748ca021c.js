"use strict";

var GameItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.name = obj.name;
        this.date = obj.date;
        this.phone = obj.phone;
        this.remark=obj.remark;
    } else {
        this.key = "";
        this.name = "";
        this.date = "";
        this.phone = "";
        this.remark="";
    }
};


GameItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var Game = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new GameItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Game.prototype = {
    init: function () {
    },
    save: function (key, name, phone, date,remark) {
        //var from = Blockchain.transaction.from;
        var gameItem = this.repo.get(key);
        if (gameItem) {
            gameItem.key = JSON.parse(gameItem).key;
            gameItem.name = JSON.parse(gameItem).name + '|-' + name;
            gameItem.phone = JSON.parse(gameItem).phone + '|-' + phone;
            gameItem.date = JSON.parse(gameItem).date + '|-' + date;
            gameItem.remark = JSON.parse(gameItem).remark + '|-' + remark;
            this.repo.put(key, gameItem);

        } else {
            gameItem = new GameItem();
            gameItem.key = key;
            gameItem.name = name;
            gameItem.phone = phone;
            gameItem.date = date;
            gameItem.remark=remark;
            this.repo.put(key, gameItem);
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
module.exports = Game;