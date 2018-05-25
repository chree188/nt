"use strict";

var PlantItem = function(text) {
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

PlantItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PlantEncyclopedia = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new PlantItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PlantEncyclopedia.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 1024 || key.length > 1024){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var plantItem = this.repo.get(key);
        if (plantItem){
            throw new Error("value has been occupied");
        }

        plantItem = new PlantItem();
        plantItem.author = from;
        plantItem.key = key;
        plantItem.value = value;

        this.repo.put(key, plantItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = PlantEncyclopedia;