"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
                this.author = obj.author;
		this.key = obj.key;
		this.value = obj.value;
		this.casus = obj.casus;
	} else {
            this.author = "";
	    this.key = "";
	    this.value = "";
	    this.casus = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LawFinder = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LawFinder.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value, casus) {

        key = key.trim();
        value = value.trim();
        casus = casus.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / statute / casus");
        }
        if (value.length > 100000 || key.length > 64 ){
            throw new Error("key / statute / casus exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(key);
        if (dictItem){
            throw new Error("key has been occupied");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;
        dictItem.casus = casus;

        this.repo.put(key, dictItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = LawFinder;