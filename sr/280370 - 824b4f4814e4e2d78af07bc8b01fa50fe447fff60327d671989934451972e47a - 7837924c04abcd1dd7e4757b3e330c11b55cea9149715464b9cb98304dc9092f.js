"use strict";

var SaveDict = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.scroe = obj.scroe;
    } else {
        this.key = "";
        this.author = "";
        this.scroe = "";
    }
};

SaveDict.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var SuperDictionary = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new SaveDict(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

SuperDictionary.prototype = {
    init: function() {
        // todo
    },

    saveScore: function(key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === "") {
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64) {
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(key);
        if (dictItem) {
            throw new Error("value has been occupied");
        }

        dictItem = new SaveDict();
        dictItem.author = 'liuyunxuan';
        dictItem.key = key;
        dictItem.value = value;

        this.repo.put(key, dictItem);
        return ('success' + key + value);
    },

    getResult: function() {
        var array = [];
        for (var i = 0; i < 6; i++) {
            var num = Math.floor(Math.random() * 6) + 1;
            array.push(num);
        }
        return array;
    }
};
module.exports = SuperDictionary;