"use strict";

var MomDictItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.nick = obj.nick;
        this.content = obj.content;
        this.addtime = obj.addtime;
        this.author = obj.author;
    } else {
        this.nick = "";
        this.content = "";
        this.addtime = "";
        this.author = "";
    }
};

MomDictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SuperDictionary = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new MomDictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperDictionary.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (nick, content, addtime) {

        nick = nick.trim();
        content = content.trim();

        if (nick === "" || content === "") {
            throw new Error("empty nick / content");
        }

        if (nick.length > 20) {
            throw new Error("nick exceed limit length")
        }

        if (content.length > 150) {
            throw new Error("content exceed limit length")
        }

        var from = Blockchain.transaction.from;

        var dictItem = new MomDictItem();
        dictItem.author = from;
        dictItem.nick = nick;
        dictItem.content = content;
        dictItem.addtime = addtime;
        var key = from + addtime;
        this.arrayMap.set(this.size, key);
        this.dataMap.put(key, dictItem);
        this.size += 1;
    },

    get: function (key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.dataMap.get(key);
    },

    forEach: function () {
        var result = [];
        for (var i = 0; i < this.size; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var temp = {
                index: i,
                key: key,
                value: object
            }
            result.push(temp);
        }
        return JSON.stringify(result);
    }
};
module.exports = SuperDictionary;