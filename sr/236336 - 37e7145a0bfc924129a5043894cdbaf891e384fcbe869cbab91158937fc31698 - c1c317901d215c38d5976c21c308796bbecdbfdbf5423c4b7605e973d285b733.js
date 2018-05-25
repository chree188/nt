"use strict";

var BallItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.date = obj.date;
		this.number = obj.number;
		this.author = obj.author;
	} else {
	    this.date = "";
	    this.number = "";
	    this.author = "";
	}
};

BallItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var RandomBall = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BallItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

RandomBall.prototype = {
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
        var dictItem = this.repo.get(key);
        if (dictItem){
            throw new Error("value has been occupied");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.value = value;

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
module.exports = RandomBall;