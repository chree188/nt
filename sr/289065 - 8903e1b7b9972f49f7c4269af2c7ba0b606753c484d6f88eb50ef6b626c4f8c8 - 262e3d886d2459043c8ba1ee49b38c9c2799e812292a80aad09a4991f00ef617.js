"use strict";

/**
 * 保存游戏的基本信息
 */
var DictItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;//玩家的钱包号
        this.sj = obj.sj;//时间
        this.score = obj.score;//成绩
    } else {
        this.key = "";//玩家的钱包号
        this.sj = "";//时间
        this.score = 0;//成绩
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
    //保存玩家的最高游戏得分
    save: function (sj, score) {

        var index = this.size;
        var from = Blockchain.transaction.from;
        var key = from;
        var dictItem = this.dataMap.get(key);
        if (dictItem) {
            if (parseInt(dictItem.score) < parseInt(score)) {
                dictItem.score = score;
                dictItem.sj = sj;
                this.dataMap.set(key, dictItem);
            }
        }
        else {
            this.arrayMap.put(index, key);
            dictItem = new DictItem();
            dictItem.key = key;
            dictItem.score = score;
            dictItem.sj = sj;
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
            result += key + '*' + object.score + '*' + object.sj + '^'
        }
        return result;
    }
};

module.exports = GameDAppStore;