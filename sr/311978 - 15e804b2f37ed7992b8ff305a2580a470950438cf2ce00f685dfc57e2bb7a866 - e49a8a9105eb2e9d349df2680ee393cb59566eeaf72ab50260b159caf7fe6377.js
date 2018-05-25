"use strict";

var TravelItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.addr = obj.addr;
        this.date = obj.date;
        this.content = obj.content;
        this.img = obj.img;
    } else {
        this.key = "";
        this.addr = "";
        this.date = "";
        this.content = "";
        this.img = "";
    }
};

TravelItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Travel = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new TravelItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Travel.prototype = {
    init: function () {
    },

    save: function (date, addr, content, img) {
        var from = Blockchain.transaction.from;
        var travelItem = this.repo.get(from);
        if (travelItem) {
            //throw new Error("addr has been occupied");
            travelItem.addr = JSON.parse(travelItem).addr + '|-' + addr;
            travelItem.content = JSON.parse(travelItem).content + '|-' + content;
            travelItem.date = JSON.parse(travelItem).date + '|-' + date;
            travelItem.img = JSON.parse(travelItem).img + '|-' + img;
            this.repo.put(from, travelItem);

        } else {
            travelItem = new TravelItem();
            travelItem.key = from;
            travelItem.addr = addr;
            travelItem.content = content;
            travelItem.date = date;
            travelItem.img = img;
            this.repo.put(from, travelItem);
        }
    },

    get: function (key) {
        var from = Blockchain.transaction.from;
        return this.repo.get(from);
    }
};
module.exports = Travel;