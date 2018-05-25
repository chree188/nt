"use strict";

/**
 * 保存DApp的基本信息
 */
var DictItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;//主键
        this.name = obj.name;//应用名称
        this.desc = obj.desc;//应用说明
        this.sj = obj.sj;//发布应用的时间
        this.from = obj.from;//发布的钱包地址
        this.lx = obj.lx;//应用的类型
        this.count = obj.count;//应用被查看的次数
        this.url = obj.url;//应用的地址
    } else {
        this.key = "";
        this.name = "";
        this.desc = "";
        this.sj = "";
        this.from = "";
        this.lx = "1";
        this.count = 0;
        this.url = "";
    }
};

DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

/**
 * 保存查看者的信息
 */
var ReadItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;//主键
        this.from = obj.from;//查看的钱包地址
        this.sj = obj.sj;//查看的时间
    } else {
        this.key = "";
        this.from = "";
        this.sj = "";
    }
};

ReadItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var DAppStore = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineMapProperty(this, "readDataMap");
    LocalContractStorage.defineMapProperty(this, "readArrayMap");
    LocalContractStorage.defineProperty(this, "size1");
    LocalContractStorage.defineProperty(this, "size");
};

DAppStore.prototype = {
    init: function () {
        this.size = 0;
        this.size1 = 0;
    },
    //发布DApp
    save: function (key, name, desc, sj,lx,url) {

        var index = this.size;
        var index1 = this.size1;
        var from = Blockchain.transaction.from;

        var dictItem = this.dataMap.get(key);
        if (dictItem) {
            dictItem.count = dictItem.count + 1;
            var readItem = new ReadItem();
            var keys = key +"*"+ sj;
            readItem.key = keys;
            readItem.from = from;
            readItem.sj = sj;
            this.readDataMap.put(keys, readItem);
            this.readArrayMap.put(index1, keys);
            this.size1 += 1;
            this.dataMap.set(key, dictItem);
        }
        else {
            this.arrayMap.set(index, key);
            dictItem = new DictItem();
            dictItem.key = key;
            dictItem.name = name;
            dictItem.desc = desc;
            dictItem.sj = sj;
            dictItem.from = from;
            dictItem.count = 0;
            dictItem.lx = lx;
            dictItem.url = url;
            this.size += 1;
            this.dataMap.put(key, dictItem);
        }
    },
    //获取DApp
    get: function (key) {
        return this.dataMap.get(key);
    },
    //获取总共的DApp个数
    len: function () {
        return this.size;
    },
    //所有的DApp信息
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
            //key*name*desc*sj*count*lx*url*from
            result += key + '*' + object.name + '*' + object.desc + '*' + object.sj + '*' + object.count + '*' + object.lx + '*' + object.url + '*' + object.from + '^'
        }
        return result;
    },
    //获取DApp被查看的详情
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
            result += key1 + "~" + object.from + '*' + object.sj + '^'
        }
        return result;
    }
};

module.exports = DAppStore;