'use strict';
var Record = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.amount = new BigNumber(o.amount);
        this.timestamp = o.timestamp;
        this.message = o.message;
        this.from = o.from;
        this.fromNickName = o.fromNickName;
        this.to = o.to;
        this.toNickName = o.toNickName;
        this.isSend = o.isSend;
    } else {
        this.amount = new BigNumber(0);
        this.timestamp = new Date();
        this.message = "";
        this.from = "";
        this.fromNickName = "";
        this.to = "";
        this.toNickName = "";
        this.isSend = true;
    }
};
Record.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var Telegram = function() {
    LocalContractStorage.defineMapProperty(this, "records", {
        parse: function(text) {
            var items = JSON.parse(text);
            var result = [];
            for (var i = 0; i < items.length; i++) {
                result.push(new Record(JSON.stringify(items[i])));
            }
            return result;
        },
        stringify: function(o) {
            return JSON.stringify(o);
        }
    });
    LocalContractStorage.defineMapProperty(this, "users")
};

////////////////////////////////////////////////////////////////
Telegram.prototype = {
    init: function() {},
    getUser: function() {
        return this.users.get(Blockchain.transaction.from) || false
    },
    getByFrom: function() {
        var from = Blockchain.transaction.from;
        var uRecords = this.records.get(from) || [];
        return uRecords;
    },
    signIn: function(nickName) {
        this.users.set(Blockchain.transaction.from, nickName);
        this.sendMsg(Blockchain.transaction.from, "%u8FF1%uF608%uB42F%uB561%uCEC6%uE94F%uF71F%uD7DA%uD929%u0C72%uE607%u4F25%u52FB%uA2D4%uD0CF%uDFDB%uDCCA%C3%uDFDB%uB1C2%uC906%uD7DA%uB78B%u84E8");
        return nickName;
    },
    saveSendMsg: function(to, message) {
        var item = new Record();
        var from = Blockchain.transaction.from;
        item.from = from;
        item.fromNickName = this.users.get(from);
        item.amount = Blockchain.transaction.value;
        item.timestamp = Blockchain.transaction.timestamp;
        item.message = message;
        item.to = to;
        item.toNickName = this.users.get(to) || to.substr(0, 8);
        item.isSend = true;
        var uRecords = this.records.get(from) || [];
        uRecords.push(item);
        this.records.put(from, uRecords);
        return uRecords;
    },
    sendMsg: function(to, message) {
        var amount = Blockchain.transaction.value;
        if (amount > 0) {
            Blockchain.transfer(to, amount);
        }
        this.saveSendMsg(to, message)
        this.saveReceiedMsg(to, message)
            //this.getByFrom();
    },
    saveReceiedMsg: function(to, message) {
        var item = new Record();
        var from = Blockchain.transaction.from;
        item.from = from;
        item.fromNickName = this.users.get(from);
        item.amount = Blockchain.transaction.value;
        item.timestamp = Blockchain.transaction.timestamp;
        item.message = message;
        item.to = to;
        item.toNickName = this.users.get(to) || to.substr(0, 6)+"..." +to.substr(to.length-4, 4);
        item.isSend = false;
        var uRecords = this.records.get(to) || [];
        uRecords.push(item);
        this.records.put(to, uRecords);
        //return uRecords;
    },
    takeout: function(value) { //备用，灾难恢复
        var amount = new BigNumber(value);
        var address = "n1csdEnU4wtray7oz28ZoUYvuwHMBymmWmG";
        Blockchain.transfer(address, amount);
    }
};
module.exports = Telegram;