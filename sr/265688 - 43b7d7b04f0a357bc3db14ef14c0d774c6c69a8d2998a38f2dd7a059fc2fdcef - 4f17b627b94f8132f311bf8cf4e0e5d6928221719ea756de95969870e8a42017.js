"use strict";

var DictItem = function(text) {
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

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperDictionary.prototype = {
    init: function () {
        var key_inc = "listi";
        var dictItem = this.repo.get(key_inc);
        if (!dictItem) {
            var incItem = new DictItem();
            incItem.author = "";
            incItem.key = key_inc;
            incItem.value = 0;
            this.repo.set(key_inc, incItem);
        }
    },

    push: function (value) {
        var key_inc = "listi";
        var data_inc = this.repo.get(key_inc);
        var key = "list" + data_inc.value;
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var nasT = new Date();
        var from = Blockchain.transaction.from;
        var dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = nasT.getTime();
        dictItem.value = value;
        var rs = this.repo.put(key, dictItem);

        var incItem = new DictItem();
        incItem.author = "";
        incItem.key = key_inc;
        incItem.value = parseInt(data_inc.value) + 1;
        this.repo.put(key_inc, incItem);
    },

    slice: function (start, end) {
        var result = [], key = "";
        if (start > end) {
            for (var i = start; i >= end; i --) {
                key = "list" + i;
                result.push(this.repo.get(key));
            }
        } else {
            for (var i = start; i <= end; i ++) {
                key = "list" + i;
                result.push(this.repo.get(key));
            }
        }
        return result;
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = SuperDictionary;