"use strict";
//1. 创建一个model方法, 这个根据需要创建model对象的个数,
var XFJInfo = function(text) {
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
// 2. 创建扩展属性
XFJInfo.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
// 3. 创建交互调用类
var InfoContract = function () {
    LocalContractStorage.defineMapProperty(this, "infoOne", {
        parse: function (text) {
            return new XFJInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
// 4.扩展方法, init默认必须有, 参数根据需要进行创建 ,里面如save get等都是自己创建
InfoContract.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("标题或内容为空！");
        }
        if (key.length > 64){
            throw new Error("标题长度超过64个字符！")
        }
        if (value.length > 256) {
            throw new Error("内容长度超过256个字符！");
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.infoOne.get(key);
        if (dictItem){
            throw new Error("您已经发布过内容！");
        }

        dictItem = new XFJInfo();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;

        this.infoOne.put(key, dictItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("地址为空！")
        }
        return this.infoOne.get(key);
    }
};
// 5. 智能合约指向这个对象
module.exports = InfoContract;