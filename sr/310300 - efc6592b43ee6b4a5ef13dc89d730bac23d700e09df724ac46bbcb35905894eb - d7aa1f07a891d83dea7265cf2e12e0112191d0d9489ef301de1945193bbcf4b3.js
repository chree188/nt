"use strict";

var UserItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.name = obj.name;
        this.sex = obj.sex;
        this.tel = obj.tel;
        this.desc = obj.desc;
        this.count = obj.count;
        this.sj = obj.sj;
        this.from = obj.from;
    } else {
        this.key = "";
        this.name = "";
        this.sex = "";
        this.tel = "";
        this.desc = "";
        this.count = 0;
        this.sj = "";
        this.from = "";
    }
};

UserItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var PublicWelfare = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

PublicWelfare.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (key, name, sex, tel, desc, sj) {
        var index = this.size;
        var from = Blockchain.transaction.from;
        var dictItem = this.dataMap.get(key);
        if (dictItem) {
            dictItem.count = parseInt(dictItem.count) + parseInt("1");
            this.dataMap.set(key, dictItem);
        }
        else {
            this.arrayMap.put(index, key);
            dictItem = new UserItem();

            dictItem.key = key;
            dictItem.name = name;
            dictItem.sex = sex;
            dictItem.tel = tel;
            dictItem.desc = desc;
            dictItem.count = 0;
            dictItem.sj = sj;
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
            result += key + '`' + object.name + '`' + object.sex + '`' + object.tel + '`' + object.desc + '`' + object.count + '`' + object.sj + '`' + object.from + '^'
        }
        return result;
    }
};
module.exports = PublicWelfare;