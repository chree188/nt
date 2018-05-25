"use strict";

/**
 * 问题的基本信息
 */
var QuestionItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;//主键
        this.name = obj.name;//问题名称
        this.desc = obj.desc;//问题说明
        this.sj = obj.sj;//发布问题的时间
        this.from = obj.from;//发布的钱包地址
        this.lx = obj.lx;//问题的类型
    } else {
        this.key = "";
        this.name = "";
        this.desc = "";
        this.sj = "";
        this.from = "";
        this.lx = "1";
    }
};

QuestionItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

/**
 * 保存回答者的信息
 */
var Answer = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;//问题的ID`时间
        this.context = obj.context;//回答者的内容
        this.from = obj.from;//回答的钱包地址
        this.sj = obj.sj;//回答时间
    } else {
        this.key = "";
        this.from = "";
        this.sj = "";
        this.context = "";
    }
};

Answer.prototype = {
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
    save: function (key, name, desc, sj,lx,context) {

        var index = this.size;
        var index1 = this.size1;
        var from = Blockchain.transaction.from;
        var questionItem = this.dataMap.get(key);
        if (questionItem) {
            var answer = new Answer();
            var keys = key +"`"+ sj;
            answer.key = keys;
            answer.from = from;
            answer.sj = sj;
            answer.context = context;
            this.readDataMap.put(keys, answer);
            this.readArrayMap.put(index1, keys);
            this.size1 += 1;
        }
        else {
            this.arrayMap.set(index, key);
            questionItem = new QuestionItem();
            questionItem.key = key;
            questionItem.name = name;
            questionItem.desc = desc;
            questionItem.sj = sj;
            questionItem.from = from;
            questionItem.lx = lx;
            this.size += 1;
            this.dataMap.put(key, questionItem);
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
            result += key + '*' + object.name + '*' + object.desc + '*' + object.sj  + '*' + object.lx  + '*' + object.from + '^'
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
            result += key1 + "~" + object.from + '*' + object.sj + '*' + object.context + '^'
        }
        return result;
    }
};

module.exports = DAppStore;