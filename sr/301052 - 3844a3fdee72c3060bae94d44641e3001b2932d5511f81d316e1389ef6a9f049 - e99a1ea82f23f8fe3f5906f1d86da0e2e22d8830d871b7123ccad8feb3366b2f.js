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
        if (key === "" ){
            throw new Error("公司名称不存在");
        }
        if (value === "" ){
            throw new Error("公司介绍不存在");
        }
        if (key.length > 100){
            throw new Error("公司名称不能多于100字")
        }
        if(value.length > 1000){
            throw new Error("公司介绍不能多于1000字")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(key);
        if (dictItem){
            throw new Error("公司已经存在");
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
            throw new Error("查询的公司名称不能为空")
        }
        return this.repo.get(key);
    }
};
module.exports = SuperDictionary;