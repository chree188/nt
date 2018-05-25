"use strict";

var IAccountItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.date = obj.date;
        this.money = obj.money;
    } else {
        this.key = "";
        this.value = "";
        this.date = "";
        this.money = "";
    }
};

IAccountItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var IAccount = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new IAccountItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

IAccount.prototype = {
    init: function () {
    },

    save: function (value, money, date) {
        var from = Blockchain.transaction.from;
        var iAccountItem = this.repo.get(from);
        if (iAccountItem) {
            //throw new Error("value has been occupied");
            iAccountItem.value = JSON.parse(iAccountItem).value + '|-' + value;
            iAccountItem.money = JSON.parse(iAccountItem).money + '|-' + money;
            iAccountItem.date = JSON.parse(iAccountItem).date + '|-' + date;
            this.repo.put(from, iAccountItem);

        } else {
            iAccountItem = new IAccountItem();
            iAccountItem.key = from;
            iAccountItem.value = value;
            iAccountItem.money = money;
            iAccountItem.date = date;
            this.repo.put(from, iAccountItem);
        }
    },

    get: function (key) {
        var from = Blockchain.transaction.from;
        return this.repo.get(from);
    }
};
module.exports = IAccount;