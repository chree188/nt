"use strict";

var DrugItem = function(text) {
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

DrugItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var DrugStore = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DrugItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

DrugStore.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }

        var from = Blockchain.transaction.from;
        var drugItem = this.repo.get(key);
        if (drugItem){
            throw new Error("value has been occupied");
        }

        drugItem = new DrugItem();
        drugItem.author = from;
        drugItem.key = key;
        drugItem.value = value;

        this.repo.put(key, drugItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = DrugStore;