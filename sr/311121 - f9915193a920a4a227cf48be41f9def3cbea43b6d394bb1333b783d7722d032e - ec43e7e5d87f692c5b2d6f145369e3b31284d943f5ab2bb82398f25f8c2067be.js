"use strict";
var DictItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;//唯一的主鍵
        this.desc = obj.desc;//简称
        this.nickeName = obj.nickeName;//图片昵称
        this.sj = obj.sj;//时间
        this.count = obj.count;//点赞个数
        this.from = obj.from;//发布者
    } else {
        this.key = "";
        this.desc = "";
        this.nickeName = "";
        this.sj = "";
        this.count = 0;
        this.from = "";
    }
};

DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ImageDAppStore = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

ImageDAppStore.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (key, desc, nickeName, sj) {
        var index = this.size;
        var from = Blockchain.transaction.from;
        var dictItem = this.dataMap.get(key);
        if (dictItem) {
            dictItem.count = parseInt(dictItem.count) + parseInt("1");
            this.dataMap.set(key, dictItem);
        }
        else {
            this.arrayMap.put(index, key);
            dictItem = new DictItem();
            dictItem.key = key;
            dictItem.desc = desc;
            dictItem.nickeName = nickeName;
            dictItem.sj = sj;
            dictItem.count = 0;
            dictItem.from = from;
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
            result += key + '*' + object.desc + '*' + object.nickeName + '*' + object.sj + '*' + object.count + '*' + object.from + '^'
        }
        return result;
    }
};

module.exports = ImageDAppStore;