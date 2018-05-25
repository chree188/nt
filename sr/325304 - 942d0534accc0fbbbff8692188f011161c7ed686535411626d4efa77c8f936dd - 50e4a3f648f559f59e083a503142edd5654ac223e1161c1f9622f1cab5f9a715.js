"use strict";

var BasketballItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.date = obj.date;
        this.type = obj.type;
    } else {
        this.key = "";
        this.value = "";
        this.date = "";
        this.type = "";
    }
};

BasketballItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Basketball = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BasketballItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Basketball.prototype = {
    init: function () {
    },

    save: function ( value, type, date) {
        var from = Blockchain.transaction.from;
        var basketballItem = this.repo.get(from);
        if (basketballItem) {
            //throw new Error("value has been occupied");
            basketballItem.value = JSON.parse(basketballItem).value + '|-' + value;
            basketballItem.type = JSON.parse(basketballItem).type + '|-' + type;
            basketballItem.date = JSON.parse(basketballItem).date + '|-' + date;
            this.repo.put(from, basketballItem);

        } else {
            basketballItem = new BasketballItem();
            basketballItem.key = from;
            basketballItem.value = value;
            basketballItem.type = type;
            basketballItem.date = date;
            this.repo.put(from, basketballItem);
        }
    },

    get: function (key) {
        var from = Blockchain.transaction.from;
        return this.repo.get(from);
    }
};
module.exports = Basketball;