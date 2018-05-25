"use strict"
var Play = function() {

    LocalContractStorage.defineMapProperty(this, "freeMap", {
        parse: function(text) {
            return parseInt(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "playingMap");
    LocalContractStorage.defineMapProperty(this, "logMap");
    LocalContractStorage.defineProperty(this, "count");
    LocalContractStorage.defineProperty(this, "adminAddress");
    LocalContractStorage.defineProperty(this, "contractBalance");

};

Play.prototype = {

    init: function() {
        this.count = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.contractBalance = new BigNumber(0);
    },

    freePlay: function() {
        var from = Blockchain.transaction.from;
        if (from == this.adminAddress) return true;
        var remain = 3;
        if (this.freeMap.get(from) || this.freeMap.get(from) == 0) {
            remain = this.freeMap.get(from);
        }
        if (remain > 0) {
            this.playingMap.put(from, "true");
            remain -= 1;
            this.freeMap.put(from, remain);
            var index = this.count;
            this.logMap.put(index, "ç©å®¶:" + from + " äº[" + new Date() + "]è¿è¡äºä¸æ¬¡æ¢é©ï¼");
            this.count += 1;
            console.log("ç©å®¶ï¼" + from + "åè´¹è¯ç©ä¸æ¬¡,åè´¹è¯ç©æ¬¡æ°å©ä½ï¼" + remain);
            return true;
        }
        console.log("ç©å®¶ï¼" + from + "è¯ç©æ¬¡æ°å·²ç»ç¨å®ï¼");
        return false;

    },

    startPlay: function() {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        this._setContractBalance(value);
        var index = this.count;
        this.count += 1;
        this.logMap.put(index, "ç©å®¶:" + from + " äº[" + new Date() + "]è¿è¡äºä¸æ¬¡æ¢é©ï¼");
        this.playingMap.put(from, "true");
        return true;
    },

    finishPlay: function() {

        var from = Blockchain.transaction.from;
        this.playingMap.put(from, "false");
        console.log("ç©å®¶ï¼" + from + " æ¢é©æè¡ç»æ");
    },



    getAdminAddress: function() {
        return this.adminAddress;
    },

    getCount: function() {
        return this.count;
    },

    getPlaying: function() {
        return this.playingMap.get(Blockchain.transaction.from);
    },
    getFree: function() {
        return this.freeMap.get(Blockchain.transaction.from);
    },

    getLog: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.count) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.count) {
            number = this.count;
        }
        var result = [];
        for (var i = offset; i < number; i++) {
            var object = this.logMap.get(i);
            result.push(object);
        }
        return result;
    },

    getLeastLog: function(limit) {
        limit = parseInt(limit);
        var result = [];
        if (limit <= 0) return result;
        var offset = this.count - limit;
        if (offset < 0) {
            offset = 0;
        }

        for (var i = this.count - 1; i >= offset; i--) {
            var object = this.logMap.get(i);
            result.push(object);
        }
        return result;
    },

    getAllLog: function() {
        var result = [];
        for (var i = this.count - 1; i >= 0; i--) {
            var object = this.logMap.get(i);
            result.push(object);
        }
        return result;
    },

    transfer: function(amount) {

        if (Blockchain.transaction.from === this.adminAddress) {
            var result = Blockchain.transfer(this.adminAddress, amount);
            if (!result) {
                throw new Error("transfer failed.");
            }
            Event.Trigger('transfer', {
                from: Blockchain.transaction.to,
                to: this.adminAddress,
                value: amount.toString()
            });
            this._setContractBalance(-amount)
        } else {
            throw new Error("Admin only");
        }
    },

    getBalance: function() {

        return this.contractBalance;
    },

    _setContractBalance: function(value) {
        var amount = new BigNumber(this.contractBalance);

        amount = amount.plus(value);

        this.contractBalance = amount;
    },
};

module.exports = Play;