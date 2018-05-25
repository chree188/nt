"use strict";

var FruitRank = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.score = obj.score;
		this.content = obj.content;
	} else {
	    this.name = "";
	    this.score = "";
	    this.content = "";
	}
};

FruitRank.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Fruiter = function () {
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this, "users");
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
    init: function () { this.size = 0; },

    save: function (name, score,content) {

        name = name.trim();
        if (name === "" ){
            throw new Error("empty name");
        }
        if (name.length > 64){
            throw new Error("name exceed limit length")
        }
        if(content.length > 128){
        	 throw new Error("content exceed limit length")
        }

        var fruitrank = this.fruit.get(name);
        if (fruitrank){
            throw new Error("name has been occupied");
        }

        fruitrank = new FruitRank();
        fruitrank.name = name;
        fruitrank.score = score;
        fruitrank.content = content;
        var pos = this.size;
         this.users.set(pos,name);
        this.fruit.put(name, fruitrank);
        this.size++;
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.fruit.get(name);
    },

    getrank: function(){
    	var result = [];
    	for(var i = 0;i < this.size; i++){
    		var name = this.users.get(i);
    		var temp = this.fruit.get(name);
    		result.push(temp);
    	}
    	return JSON.stringify(result);
    }
};
module.exports = Fruiter;