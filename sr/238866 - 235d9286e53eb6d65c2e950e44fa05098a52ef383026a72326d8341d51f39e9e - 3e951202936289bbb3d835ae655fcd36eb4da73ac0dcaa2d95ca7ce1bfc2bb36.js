"use strict";

var LoveItem = function(text) {
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

LoveItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LoveColumn = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new LoveItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LoveColumn.prototype = {
    init: function () {
        // todo
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
        var loveItem = this.repo.get(key);
        if (loveItem){
            throw new Error("value has been occupied");
        }

        loveItem = new LoveItem();
        loveItem.author = from;
        loveItem.key = key;
        loveItem.value = value;

        this.repo.put(key, loveItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = LoveColumn;