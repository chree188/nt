"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.owner = obj.owner;
		this.author = obj.author;
	} else {
	    this.key = ""; //省份
	    this.author = "";
	    this.owner = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ProvinceOwner = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

ProvinceOwner.prototype = {
    init: function () {
        // todo
    },

    save: function (key, owner) {

        key = key.trim();
        owner = owner.trim();
        if (key === "" || owner === ""){
            throw new Error("empty key / owner");
        }
        if (owner.length > 64 || key.length > 64){
            throw new Error("key / owner exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(key);
        if (dictItem){
            throw new Error("owner has been occupied");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.owner = owner;

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
module.exports = ProvinceOwner;