"use strict";

var LoveItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.type = obj.type;
        this.key = obj.key;
        this.value = obj.value;
        this.author = obj.author;
        this.timestamp = obj.timestamp;
    } else {
        this.type = "";
        this.key = "";
        this.value = "";
        this.author = "";
        this.timestamp = "";
    }
};

LoveItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var LoveDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new LoveItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LoveDictionary.prototype = {
    init: function () {

    },

    save: function (type, value, author) {
        value = value.trim();
        if (type === "") {
            throw new Error("表白类型不正确");
        }
        else if (value === "") {
            throw new Error("请输入表白信息");
        } else if (value.length > 520) {
            throw new Error("表白信息超过520个字符")
        } else if (author === "") {
            throw new Error("请留下你的名字");
        }

        var content = JSON.parse(value);
        var key = type + "_" + content.type + "_" + content.to;
        var loveItem = this.repo.get(key);
        if (loveItem) {
            throw new Error("有人抢先表白了");
        }
        loveItem = new LoveItem();
        loveItem.type = type;
        loveItem.key = key;
        loveItem.value = value;
        loveItem.author = author;
        loveItem.timestamp = Blockchain.block.timestamp;
        this.repo.put(key, loveItem);
    },

    get: function (type, subType, to) {
        if (type === "" || subType === "" || to === "") {
            throw new Error("传入参数不正确");
        }
        var key = type + "_" + subType + "_" + to;
        return this.repo.get(key);
    }
};
module.exports = LoveDictionary;