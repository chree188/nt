"use strict";

var TiwitterItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;//timestamp
		this.value = obj.value;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	}
};

TiwitterItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SimpleTwitter = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new TiwitterItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

SimpleTwitter.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(key);
        if (dictItem){
            throw new Error("value has been occupied");
        }

        dictItem = new TiwitterItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;

        this.repo.put(key, dictItem);
        //
        var index = this.size;
        this.arrayMap.set(index, key);
        this.dataMap.set(key, value);
        this.size +=1;
    },

    len:function(){
        return this.size;
    },

    get: function (key) {
        if ( key === -1 ) {
            return JSON.stringify(this.repo);
        }
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key");
        }
        return this.repo.get(key);
    },

    getIndexKeys: function () {
        var result  = "";
        for(var i=0;i<this.size;i++){
            var key = this.arrayMap.get(i);
            result += "index:"+i+" key:"+ key +"_";
        }
        return result;
    },
    getKeyValues: function () {
        var result = {};
        for(var i=0;i<this.size;i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            // result += "key:" + key + " value:" + object + "_";
            result[key] = object;
        }
        return JSON.stringify(result);
    },

    iterate: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
            number = this.size;
        }
        var result  = "";
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result += "index:"+i+" key:"+ key + " value:" +object+"_";
        }
        return result;
    },
    getAll: function () {
        var result = [];
        for(var i=0;i<this.size;i++) {
            var key = this.arrayMap.get(i);
            var twitterItem = this.repo.get(key);
            result.push(twitterItem);
        }
        return JSON.stringify(result);
    },



};
module.exports = SimpleTwitter;