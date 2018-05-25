"use strict";
var EsspItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.name = obj.name;
        this.desc = obj.desc;
        this.sj = obj.sj;
        this.from = obj.from;
        this.lx = obj.lx;
        this.phone = obj.phone;
    } else {
        this.key = "";
        this.name = "";
        this.desc = "";
        this.sj = "";
        this.from = "";
        this.lx = "1";
        this.phone = "";
    }
};

EsspItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var Jlxx = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.context = obj.context;
        this.from = obj.from;
        this.sj = obj.sj;
        this.phone1 = obj.phone1;
    } else {
        this.key = "";
        this.from = "";
        this.sj = "";
        this.context = "";
        this.phone1 = "12345678901";
    }
};

Jlxx.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var DAppContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineMapProperty(this, "readDataMap");
    LocalContractStorage.defineMapProperty(this, "readArrayMap");
    LocalContractStorage.defineProperty(this, "size1");
    LocalContractStorage.defineProperty(this, "size");
};

DAppContract.prototype = {
    init: function () {
        this.size = 0;
        this.size1 = 0;
    },
    save: function (key, name, desc, sj, lx, context,phone) {

        var index = this.size;
        var index1 = this.size1;
        var from = Blockchain.transaction.from;
        var esspItem = this.dataMap.get(key);
        if (esspItem) {
            var jlxx = new Jlxx();
            var keys = key + "`" + sj;
            jlxx.key = keys;
            jlxx.from = from;
            jlxx.sj = sj;
            jlxx.context = context;
            jlxx.phone1 = phone;
            this.readDataMap.put(keys, jlxx);
            this.readArrayMap.put(index1, keys);
            this.size1 += 1;
        }
        else {
            this.arrayMap.set(index, key);
            esspItem = new EsspItem();
            esspItem.key = key;
            esspItem.name = name;
            esspItem.desc = desc;
            esspItem.sj = sj;
            esspItem.from = from;
            esspItem.lx = lx;
            esspItem.phone = phone;
            this.size += 1;
            this.dataMap.put(key, esspItem);
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
            result += key + '*' + object.name + '*' + object.desc + '*' + object.sj + '*' + object.lx + '*' + object.from + '*' + object.phone + '^'
        }
        return result;
    },
    forEachRead: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size1) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size1) {
            number = this.size1;
        }
        var result = '';
        for (var i = offset; i < number; i++) {
            var key1 = this.readArrayMap.get(i);
            var object = this.readDataMap.get(key1);
            result += key1 + "~" + object.from + '*' + object.sj + '*' + object.context + '*' + object.phone1 + '^'
        }
        return result;
    }
};

module.exports = DAppContract;