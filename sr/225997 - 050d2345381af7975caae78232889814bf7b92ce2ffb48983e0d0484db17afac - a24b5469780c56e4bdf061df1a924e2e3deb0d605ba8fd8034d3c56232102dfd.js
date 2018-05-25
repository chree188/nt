"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
        this.value = obj.value;
        this.name = obj.name;
        this.author = obj.author;
        this.time = obj.time;
	} else {
	    this.key = "";
	    this.author = "";
        this.value = "";
        this.time = ""
        this.name = ""
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Promise = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

Promise.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (key, value, name) {

        key = key.trim();
        value = value.trim();
        name = name.trim();
        if (key === "" || value === "" || name === ""){
            throw new Error("empty value / name");
        }
        if (value.length > 120 || name.length > 20){
            throw new Error("value / name exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(key);
        if (dictItem){
            throw new Error("value has been occupied");
        }
        var index = this.size;
        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;
        dictItem.name = name;
        //dictItem.time = new Date().getTime();

        this.arrayMap.set(index, key);
        this.repo.put(key, dictItem);
        this.size +=1;

        return "success";
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },

    len:function(){
        return this.size;
      },

    test:function(){
        return "test sucess";
      },

    test1:function(key){

        if(key==="123"){
            return "OK!!!";
        }
        return "param test sucess";
      },

    forEach: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result = new Array();
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.repo.get(key);
            result[i] = object;
        }
        return result;
    }
};
module.exports = Promise;