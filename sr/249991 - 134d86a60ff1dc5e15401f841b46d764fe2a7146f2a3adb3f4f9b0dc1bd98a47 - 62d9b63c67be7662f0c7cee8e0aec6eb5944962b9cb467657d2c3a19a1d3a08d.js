"use strict";

var MarsItem = function(text) {
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

MarsItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Mars = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new MarsItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Mars.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 256 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var MarsItem = this.repo.get(key);
        if (MarsItem){
            throw new Error("value has been occupied");
        }

        MarsItem = new MarsItem();
        MarsItem.author = from;
        MarsItem.key = key;
        MarsItem.value = value;

        this.repo.put(key, MarsItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = Mars;