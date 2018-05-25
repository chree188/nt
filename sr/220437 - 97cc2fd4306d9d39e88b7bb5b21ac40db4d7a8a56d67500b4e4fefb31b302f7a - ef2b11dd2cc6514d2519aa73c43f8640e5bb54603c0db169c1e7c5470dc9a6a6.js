"use strict";

var Wish = function(text) {
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

Wish.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var WishDictionary = function () {

    LocalContractStorage.defineProperties(this, {
        _name: null, //合约名字
        _creator: null  //合约创建者
    });

    LocalContractStorage.defineMapProperties(this,{
        "wishrepo":{
            parse: function (text) {
                return new Wish(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
};

WishDictionary.prototype = {
    init: function () {
        this._name = "wishs";
        this._creator = Blockchain.transaction.from;
    },

    save: function (key, value) {
        if (key === "" || value === ""){
            throw new Error("请输入，标题和内容！");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("字符不能太长！");
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.wishrepo.get(key);
        if (dictItem){
            throw new Error("心愿已存在");
        }

        dictItem = new Wish();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;

        this.wishrepo.put(key, dictItem);
    },

    get: function (key) {
        if ( key === "" ) {
            throw new Error("心愿标题为空！")
        }
        return this.wishrepo.get(key);
    }
};
module.exports = WishDictionary;