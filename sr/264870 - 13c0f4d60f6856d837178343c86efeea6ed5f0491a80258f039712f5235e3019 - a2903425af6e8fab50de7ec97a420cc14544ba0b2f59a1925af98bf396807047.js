"use strict";

var ObjectItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.content = obj.content;
        this.addtime = obj.addtime;
        this.people = obj.people;
    } else {
        this.content = "";
        this.addtime = "";
        this.people = "";
    }
};

ObjectItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SuperDictionary = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new ObjectItem(text);
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

    save: function (content, addtime) {

        content = content.trim();

        if (content === "") {
            throw new Error("empty content");
        }

        var from = Blockchain.transaction.from;

        var dictItem = new ObjectItem();
        dictItem.people = from;
        dictItem.content = content;
        dictItem.addtime = addtime;
        var key = from;
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