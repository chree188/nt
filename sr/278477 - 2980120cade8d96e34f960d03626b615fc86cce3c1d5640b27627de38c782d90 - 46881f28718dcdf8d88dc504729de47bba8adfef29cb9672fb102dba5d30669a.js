"use strict";

var CodeItem = function(text) {
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

CodeItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var CodeSnippets = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new CodeItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CodeSnippets.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim().toLowerCase();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var codeItem = this.repo.get(key);
        if (codeItem){
            throw new Error("value has been occupied");
        }

        codeItem = new CodeItem();
        codeItem.author = from;
        codeItem.key = key;
        codeItem.value = value;

        this.repo.put(key, codeItem);
    },

    get: function (key) {
        key = key.trim().toLowerCase();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = CodeSnippets;