"use strict";

var DrugItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.content = obj.content;
		this.author = obj.author;
	} else {
	    this.name = "";
	    this.content = "";
        this.author = "";
	}
};

DrugItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var DrugStore = function () {
    LocalContractStorage.defineMapProperty(this, "drugInfo", {
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
    },

    saveDrugItem: function (name, content) {
        name = name.trim();
        content = content.trim();

        if (name === "" || content === ""){
            throw new Error("empty name / content");
        }

        var from = Blockchain.transaction.from;

        var drugItem = this.drugInfo.get(name);

        if (drugItem){
            throw new Error("content has been occupied");
        }

        drugItem = new DrugItem();
        
        drugItem.name = name;
        drugItem.content = content;

        drugItem.author = from;

        this.drugInfo.put(name, drugItem);
    },

    getDrugItem: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.drugInfo.get(name);
    }
};
module.exports = DrugStore;