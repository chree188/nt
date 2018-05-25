"use strict";

var DictItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.sj = obj.sj;
        this.score = obj.score;
        this.xd = obj.xd;
    } else {
        this.key = "";
        this.sj = "";
        this.score = 0;
        this.xd = "";
    }
};

DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var GameDAppStore = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

GameDAppStore.prototype = {
    init: function () {
        this.size = 0;
        this.size1 = 0;
    },
    save: function (sj, score,xd) {

        var index = this.size;
        var from = Blockchain.transaction.from;
        var key = from;
        var dictItem = this.dataMap.get(key);
        if (dictItem) {
            if (parseInt(dictItem.score) < parseInt(score)) {
                dictItem.score = score;
                dictItem.sj = sj;
                dictItem.xd = xd;
                this.dataMap.set(key, dictItem);
            }
        }
        else {
            this.arrayMap.put(index, key);
            dictItem = new DictItem();
            dictItem.key = key;
            dictItem.score = score;
            dictItem.sj = sj;
            dictItem.xd = xd;
            this.size += 1;
            this.dataMap.put(key, dictItem);
        }
    },
    get: function (key) {
        return this.dataMap.get(key);
    },
    len: function () {
        return this.size;
    },
    forEach: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = '';
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result += key + '*' + object.score + '*' + object.sj + '*' + object.xd + '^'
        }
        return result;
    }
};
module.exports = GameDAppStore;