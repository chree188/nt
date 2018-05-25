"use strict";

var AccountItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        // this.timestamp = obj.timestamp;
        this.ntime = obj.ntime;
        this.ncategory = obj.ncategory;
        this.namount = obj.namount;
        this.ntext = obj.ntext;
        this.ncoin = obj.ncoin;
    } else {
        // this.timestamp = '';
        this.ntime = '';
        this.ncategory = '';
        this.namount = '';
        this.ntext = '';
        this.ncoin = '';
    }
}

AccountItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}


var AccountContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

AccountContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (timestamp, ntime, ncategory, namount, ntext, ncoin) {
        var index = this.size;
        if (timestamp === "" || ntime === "" || ncategory === "" || namount === "") {
            throw new Error("时间、类别、金额为必填字段");
        }
        if (timestamp.length > 20 || ntime.length > 20 || ncategory.length > 10 || namount.length > 20 || ntext.length > 200) {
            throw new Error("字段长度超出限制！")
        }
        var from = Blockchain.transaction.from;
        var AccountMap = this.dataMap.get(from);
        if (!AccountMap) {
            AccountMap = {};
            this.arrayMap.set(index, from);
            this.size += 1;
        }
        var accountItem = new AccountItem();
        accountItem.ntime = ntime;
        accountItem.ncategory = ncategory;
        accountItem.namount = namount;
        accountItem.ntext = ntext;
        accountItem.ncoin = ncoin;
        AccountMap[timestamp] = accountItem;
        this.dataMap.set(from, AccountMap);

    },


    get: function () {
        var from = Blockchain.transaction.from;
        let cData = this.dataMap.get(from);
        return cData;
    },

    len: function () {
        return this.size;
    },

};

module.exports = AccountContract;