"use strict";

var DictItemNew = function(text) {
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

DictItemNew.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionaryNew = function () {
    LocalContractStorage.defineMapProperty(this, "reponew", {
        parse: function (text) {
            return new DictItemNew(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperDictionaryNew.prototype = {
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
        var dictItem = this.reponew.get(key);
        if (dictItem){
            throw new Error("value has been occupied");
        }

        dictItem = new DictItemNew();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;

        this.reponew.put(key, dictItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.reponew.get(key);
    }
};
module.exports = SuperDictionaryNew;