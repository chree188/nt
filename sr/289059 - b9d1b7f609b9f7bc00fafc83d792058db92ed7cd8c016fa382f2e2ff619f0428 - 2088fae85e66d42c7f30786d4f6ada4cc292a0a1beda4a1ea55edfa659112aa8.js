"use strict";

var BlackItem = function (text) {
    if (text) {
        text = text.replace(/\\/g, "");
        var obj = JSON.parse(text);
        this.title = obj.title;
        // this.from = obj.from;
        // this.keywords = obj.keywords;
        this.company = obj.company;
        this.content = obj.content;
        // this.contact = obj.contact;
        this.createdate = new Date();
    } else {
        this.title = "";
        // this.keywords = "";
        this.company = "";
        this.content = "";
        // this.contact = "";
        this.createdate = new Date();
    }
};

BlackItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BlackContract = function () {
    //数据
    LocalContractStorage.defineMapProperty(this, "dataMap");
    //index 到 字典key索引
    LocalContractStorage.defineMapProperty(this, "indexMap");

    //字典size
    LocalContractStorage.defineProperty(this, "size");
};

BlackContract.prototype = {
    init: function () {
        this.size = 0;
    },

    // 保存
    save: function (key, value) {
        //检查入参数
        var blackItem = new BlackItem(value);
        if (typeof(key) == "undefined" || key == '') {
            throw new Error("empty key");
        }
        if (blackItem.title == '' || blackItem.content == '') {
            throw new Error("empty error");
        }

        //如果之前没有添加过，初始化数组
        var blackArray = this.dataMap.get(key);
        if (typeof(blackArray) == "undefined" || blackArray == null) {
            blackArray = [];
            var index = this.size;
            this.indexMap.set(index, key);
            this.size += 1;
        }

        //添加到数组
        blackArray.push(blackItem);
        //存储到发布遗言的链中
        this.dataMap.set(key, blackArray);
    },
    // 搜索关键字
    search: function (key) {
        if (key === "") {
            throw new Error("empty key")
        }

        var keyArray = [];
        if (this.size == 0) {
            return keyArray;
        }

        for (var i = 0; i < this.size; i++) {
            var storeKey = this.indexMap.get(i);
            //如果匹配到了数据
            if (storeKey.indexOf(key) != -1) {
                keyArray.push(storeKey);
            }
        }

        return JSON.stringify(keyArray);
    },
    
    delete: function (key, index) {
        var master = 'n1MWYwsAJQDBjGL7kY5fwkfPcoJUb2HoD58';
        var from = Blockchain.transaction.from;
        //如果不是管理员,拒绝×
        if (master != from) {
            throw new Error("您没有权限读取");
        }

        //检查入参数
        index = parseInt(index);
        if (typeof(key) == "undefined" || key == '' || isNaN(index)) {
            throw new Error("params error");
        }

        //如果之前没有添加过，初始化数组
        var blackArray = this.dataMap.get(key);
        if (typeof(blackArray) == "undefined" || blackArray == null) {
            throw new Error("can note find dataMap");
        }

        var len = blackArray.length;
        var stayData = [];

        for (var i = 0; i < len; i++) {
            if (i != index){
                stayData.push(blackArray[i]);
            }
        }

        //添加到数组
        this.dataMap.set(key, stayData);
    },

    len: function () {
        return this.size;
    },

    top: function () {
        var limit = 20;
        if (limit > this.size) {
            limit = this.size;
        }
        var end = this.size - limit;
        var result = [];
        for (var i = this.size; i > end; i--) {
            var key = this.indexMap.get(i - 1);
            // var object = this.dataMap.get(key);
            result.push(key);
        }
        return JSON.stringify(result);
    },

    page: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = [];
        for (var i = offset; i < number; i++) {
            var key = this.indexMap.get(i);
            var object = this.dataMap.get(key);
            result.push(object);
        }
        return JSON.stringify(result);
    },

    get: function (key) {
        if (key === "") {
            throw new Error("empty key")
        }
        return this.dataMap.get(key);
    }
};
module.exports = BlackContract;