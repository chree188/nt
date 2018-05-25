"use strict";

var FavoriteItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.website = obj.website;
		this.description = obj.description;
		this.author = obj.author;
		this.time = obj.time;
	} else {
	    this.name = "";
		this.website = "";
		this.description = "";
		this.author = "";
		this.time = "";
	}
};

FavoriteItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var FavoriteContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new FavoriteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

FavoriteContract.prototype = {
    init: function () {
        // todo
    },

    save: function (name,website,description) {

        name = name.trim();
        website = website.trim();
        description = description.trim();
        if (name === "" || website === ""|| description === ""){
            throw new Error("empty value");
        }
        if (name.length > 256|| website.length > 256|| description.length > 256){
            throw new Error("value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var favoriteItem = this.repo.get(name);
        if (favoriteItem){
            throw new Error("name has been occupied");
        }
        var date = new Date();
        favoriteItem = new FavoriteItem();
        favoriteItem.author = from;
        favoriteItem.name = name;
        favoriteItem.website = website;
        favoriteItem.description = description;
        favoriteItem.time = date.toString();
        this.repo.put(name, favoriteItem);
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.repo.get(name);
    }
    
};
module.exports = FavoriteContract;