"use strict";

var BitBookItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.author = obj.author;
		this.value = obj.value;
	} else {
		this.key = "";
	    this.author = "";
	    this.value = new Array();
	}
};

BitBookItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var BitBookContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BitBookItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BitBookContract.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 164 || key.length > 164){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var bitBookItem = this.repo.get(from);
        if (bitBookItem){
            // 已存在
			//bitBookItem.key = from;
			var valueList = bitBookItem.value;
			valueList.push(value);
			bitBookItem.value = valueList;
        }else{
			// 新增
			bitBookItem = new BitBookItem();
			bitBookItem.author = from;
			bitBookItem.key = from;
			var valueList = bitBookItem.value;
			if(!valueList){
				valueList = new Array();
			}
			valueList.push(value);
			bitBookItem.value = valueList;
		}

        this.repo.put(from, bitBookItem);
    },

    get: function (key) {
        key = key.trim();
		var from = Blockchain.transaction.from;
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(from);
    }
};
module.exports = BitBookContract;