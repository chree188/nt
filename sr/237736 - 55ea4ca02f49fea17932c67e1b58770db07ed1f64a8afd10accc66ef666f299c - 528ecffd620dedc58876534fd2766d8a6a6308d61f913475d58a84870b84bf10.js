"use strict";

var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.author = obj.author;
    } else {
        this.key = "";
        this.author = "";
        this.value = "";
    }
};
DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
SuperDictionary.prototype = {
    init: function () {
        // todo
    },
    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("参数不能为空！");
        }
        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(key);
        if (dictItem){
            throw new Error("备忘录已经存在！");
        }
        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;

        this.repo.put(key, dictItem);
    },
    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("备忘录不存在")
        }
        return this.repo.get(key);
    },
    del: function(key){
        key = key.trim();
        if(key===""){
          throw new Error("备忘录不存在");
        }
        return this.repo.delete(key);
    }
};
module.exports = SuperDictionary;