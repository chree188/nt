"use strict";

var ColorMonth = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.records = obj.records;
    } else {
        this.records = "";
    }
};

ColorMonth.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var ColorDate = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new ColorMonth(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

ColorDate.prototype = {
    init: function() {},

    add: function(key, records) {
        key = key.trim();
        if (key === "") {
            throw new Error("key为空")
        }
        var from = Blockchain.transaction.from;
        key = from + ":" + key;

        var colorMonth = new ColorMonth();
        colorMonth.records = records;

        this.repo.put(key, colorMonth);
    },

    getAddr: function() {
        var from = Blockchain.transaction.from;
        return { "from": from };
    },

    getWithOutAddr: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        var from = Blockchain.transaction.from;
        key = from + ":" + key;
        return this.repo.get(key);
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = ColorDate;