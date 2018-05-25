"use strict";

var FruitRank = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.score = obj.score;
	} else {
	    this.name = "";
	    this.score = "";
	}
};

FruitRank.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Fruiter = function () {
    LocalContractStorage.defineMapProperty(this, "fruit", {
        parse: function (text) {
            return new FruitRank(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

Fruiter.prototype = {
    init: function () { },

    save: function (name, score) {

        name = name.trim();
        if (name === "" ){
            throw new Error("empty name");
        }
        if (name.length > 64){
            throw new Error("name exceed limit length")
        }

        var fruitrank = this.fruit.get(name);
        if (fruitrank){
            throw new Error("name has been occupied");
        }

        fruitrank = new FruitRank();
        fruitrank.name = name;
        fruitrank.score = score;

        this.fruit.put(name, fruitrank);
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.fruit.get(name);
    }
};
module.exports = Fruiter;