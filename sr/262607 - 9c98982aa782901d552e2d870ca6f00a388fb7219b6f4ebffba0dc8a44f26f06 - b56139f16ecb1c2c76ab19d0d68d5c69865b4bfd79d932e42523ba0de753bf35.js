"use strict";

var BookItem = function (text) {
    if (text) {
        text = text.replace(/\\/g, "");
        var obj = JSON.parse(text);
        this.cloth = obj.cloth;
        this.food = obj.food;
        this.house = obj.house;
        this.traffic = obj.traffic;
        this.education = obj.education;
        this.invest = obj.invest;
        this.bookdate = obj.bookdate;
        this.content = obj.content;
        this.createdate = new Date();
    } else {
        this.cloth = "";
        this.food = "";
        this.house = "";
        this.traffic = "";
        this.education = "";
        this.invest = "";
        this.bookdate = "";
        this.content = "";
        this.createdate = new Date();
    }
};

BookItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BookContract = function () {
    //数据
    LocalContractStorage.defineMapProperty(this, "dataMap");
    //index 到 字典key索引
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    //字典size
    LocalContractStorage.defineProperty(this, "size");
};

BookContract.prototype = {
    init: function () {
        this.size = 0;
    },

    // 保存
    save: function (value) {
        //检查入参数
        var bookItem = new BookItem(value);
        var bookdate = bookItem['bookdate'];
        if (typeof(bookdate) == "undefined" || bookdate == ''){
            throw new Error("empty bookdate");
        }

        //如果之前没有添加过，初始化数组
        var from = Blockchain.transaction.from;
        var bookMap = this.dataMap.get(from);

        if (typeof(bookMap) == "undefined" || bookMap == null) {
            bookMap = {};
            var index = this.size;
            this.arrayMap.set(index, from);
            this.size += 1;
        }

        //添加到数组
        bookMap[bookdate] = bookItem;
        //存储到发布遗言的链中
        this.dataMap.set(from, bookMap);
    },

    // 查询最近7天的
    getAll: function () {
        var from = Blockchain.transaction.from;
        if (from === "") {
            throw new Error("empty from")
        }
        return this.dataMap.get(from);
    },
    getWeek: function () {
        var from = Blockchain.transaction.from;
        if (from === "") {
            throw new Error("empty from")
        }

        var bookMap = this.dataMap.get(from);
        return this.dataMap.get(from);
    },
    getMonth: function () {
        var from = Blockchain.transaction.from;
        if (from === "") {
            throw new Error("empty from")
        }
        return this.dataMap.get(from);
    },
    getYear: function () {
        var from = Blockchain.transaction.from;
        if (from === "") {
            throw new Error("empty from")
        }
        return this.dataMap.get(from);
    }

};
module.exports = BookContract;