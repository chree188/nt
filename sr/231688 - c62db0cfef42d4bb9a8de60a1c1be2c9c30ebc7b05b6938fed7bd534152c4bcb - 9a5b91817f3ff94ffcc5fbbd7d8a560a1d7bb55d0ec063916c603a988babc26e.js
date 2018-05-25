"use strict";

var BottleItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
    } else {
        this.key = "";
        this.value = "";
    }
};

BottleItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Bottle = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BottleItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

Bottle.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (key, value) {
        key = key.trim();
        value = value.trim();

        var dictItem = this.repo.get(key);
        if (dictItem) {
            //throw new Error("value has been occupied");
            dictItem.value = JSON.parse(dictItem).value + '-' + value;
            this.repo.put(key, dictItem);
        } else {
            dictItem = new BottleItem();
            dictItem.key = key;
            dictItem.value = value;
            this.repo.put(key, dictItem);
            this.size +=1;
        }
    },
    len:function(){
        return this.size;
    },
    get: function (key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = Bottle;