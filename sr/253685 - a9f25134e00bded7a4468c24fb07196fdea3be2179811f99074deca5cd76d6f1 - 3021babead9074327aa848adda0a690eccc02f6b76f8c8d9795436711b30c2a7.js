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

//序列化对象
DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//定义两个Map 用来存储数据
var AppContract = function () {
   /* LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");*/
    
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};


AppContract.prototype = {
    init: function () {
       // this.size = 0;
    },
    save: function (key,value) {
        //获取对方钱包地址
        var from = Blockchain.transaction.from;
        //var index = this.size;
        //this.arrayMap.set(index, from);
        //传过来的值装到对象中
        
        var dictItem = this.dataMap.get(key);
        if (dictItem){
            throw new Error("value has been occupied");
        }
        //保存信息
        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;
        this.dataMap.put(key, dictItem);
    },
    
    get: function (key) {
        return this.dataMap.get(key);
    },
    
    //查询所有 根据偏移量和总量查询
    forEach: function(limit, offset,searchPara){
        
    }
};
module.exports = AppContract;