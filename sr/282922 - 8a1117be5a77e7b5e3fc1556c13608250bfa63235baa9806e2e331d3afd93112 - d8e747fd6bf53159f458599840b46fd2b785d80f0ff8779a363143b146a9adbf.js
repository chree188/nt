"use strict";

var PredictionItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.date = obj.date;
        this.value = obj.value;
        this.author = obj.author;
        this.index = obj.index;
    } else {
        this.date = "";
        this.author = "";
        this.value = "";
        this.index = "";
    }
};

PredictionItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var SuperPrediction = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new PredictionItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};
SuperPrediction.prototype = {
    init: function() {
        this.size = 0;
    },

    save: function(value, date) {


        value = value.trim();
        if (value === "") {
            throw new Error("empty key / value");
        }
        if (value.length > 64) {
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem;
        var index = this.size;

        dictItem = new PredictionItem();
        dictItem.author = from;
        dictItem.date = date;
        dictItem.value = value;
        dictItem.index = index;
        this.repo.put(index, dictItem);
        this.size += 1;
    },

    get: function() {
        var result = [];
        for (var i = 0; i < this.size; i++) {
            var object = this.repo.get(i);
            result.push(object);
        }
        return result;
    }
};
module.exports = SuperPrediction;