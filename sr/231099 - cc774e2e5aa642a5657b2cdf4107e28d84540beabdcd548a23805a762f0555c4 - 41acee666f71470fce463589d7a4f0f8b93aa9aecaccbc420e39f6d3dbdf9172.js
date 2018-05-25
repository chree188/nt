"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.content = obj.content;
		this.author = obj.author;
        this.time = obj.time;
	} else {
	    this.name = "";
	    this.author = "";
	    this.content = "";
        this.time = ""
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionary = function () {
 
   LocalContractStorage.defineMapProperty(this, "arrayMap");

   LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   LocalContractStorage.defineProperty(this, "size");
};

SuperDictionary.prototype = {
    init: function () {
        this.size = 0;
    },


    save: function (key, value,time) {
        var index = this.size;
        this.arrayMap.set(index, key);
        

        var name = key.trim();
        var content = value.trim();
        if (name === "" || content === ""){
            throw new Error("empty name / content");
        }
        if (content.length > 200 || name.length > 100){
            throw new Error("name / content exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.dataMap.get(name);
        if (dictItem){
            throw new Error("昵称已经被占用");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.name = name;
        dictItem.content = content;
        dictItem.time = time;

        this.dataMap.put(name, dictItem);

        this.size +=1;

    },

    get: function (key) {
        var name = key.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.dataMap.get(name);
    },

    len:function(){
      return this.size;
    },

    getAll: function(limit){
        var number = this.size;
        var result = [];
        if (number === 0) {
            return result;
        }
        limit = parseInt(limit);

        if (limit <= 0) {
            limit = 10;
        }
        if (limit > 30) {
            limit = 30;
        }
        if (limit > number) {
            limit = number;
        }
        for(var i = number - 1;i >= (number - limit);i--){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result.push(object);
        }
        return result;
    }

};
module.exports = SuperDictionary;