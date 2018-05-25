"use strict";

var DialectItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
        this.author = obj.author;
        this.sentence = obj.sentence;
	} else {
	    this.key = "";
	    this.author = "";
        this.value = "";
        this.sentence = "";
	}
};

DialectItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var DialectWiki = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DialectItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

DialectWiki.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value, sentence) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dialectItem = this.repo.get(key);
        if (dialectItem){
            throw new Error("value has been occupied");
        }

        dialectItem = new DialectItem();
        dialectItem.author = from;
        dialectItem.key = key;
        dialectItem.value = value;
        dialectItem.sentence = sentence;

        this.repo.put(key, dialectItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = DialectWiki;