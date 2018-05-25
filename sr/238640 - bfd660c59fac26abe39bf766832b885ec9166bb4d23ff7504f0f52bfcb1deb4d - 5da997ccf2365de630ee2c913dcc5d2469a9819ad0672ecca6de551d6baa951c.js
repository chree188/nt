"use strict";

var Item = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
        this.author = obj.author;
        this.time = obj.time;
	} else {
	    this.key = "";
	    this.author = "";
        this.value = "";
        this.time = "";
	}
};

Item.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var AnonymousLetter = function () {
	LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new Item(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

AnonymousLetter.prototype = {
    init: function () {
        // todo
    },

    size: function(key){
        var size = this.arrayMap.get(key);
		if(size == null){
			return 0;
        }
        return size;
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
        var size = this.arrayMap.get(key);
		if(size == null){
			size = 0;
		}
        
        var key_ = key + '_' + size;
        var item = new Item();
        item.author = from;
        item.key = key;
        item.value = value;
        item.time = new Date().getTime();
		
		size += 1;
		
		this.arrayMap.put(key, size);
        this.dataMap.put(key_, item);
    },

    get: function (key, limit, offset) {
		limit = parseInt(limit);
		offset = parseInt(offset);
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
		
		var size = this.arrayMap.get(key);
		if(size == null){
			return "";
		}
		
		if(size <= offset){
			return "";
		}
		
		if(size - offset > limit){
			size = limit + offset;
		}
		
		var result  = new Array();
        for(var i = offset; i < size; i++){
            var key_ = key + '_' + i;
            var object = this.dataMap.get(key_);
            result.push(object);
        }
        return result;
    }
};
module.exports = AnonymousLetter;