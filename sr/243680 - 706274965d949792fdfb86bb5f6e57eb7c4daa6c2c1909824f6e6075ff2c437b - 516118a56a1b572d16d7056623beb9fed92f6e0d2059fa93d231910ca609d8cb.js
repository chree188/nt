"use strict";

var Wish = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.url = obj.url;
        this.author=obj.author;
	} else {
	    this.key = "";
	    this.url = "";
	    this.value = "";
        this.author="";
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

    save: function (key, url,value) {
        if (key === "" || value === ""){
            throw new Error("请输入，藏品信息");
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.wishrepo.get(key);
        if (dictItem){
            throw new Error("文物已存在");
        }

        dictItem = new Wish();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;
        dictItem.url=url;

        this.wishrepo.put(key, dictItem);
    },

    get: function (key) {
        if ( key === "" ) {
            throw new Error("标题不能为空")
        }
        return this.wishrepo.get(key);
    }
};
module.exports = WishDictionary;