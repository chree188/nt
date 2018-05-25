"use strict";

var WishItem = function(text) {
	if (text) {
			var obj = JSON.parse(text);
			this.author = obj.author;
			this.name = obj.name;
			this.wish.push(obj.wish);
	} else {
			this.author = "";
	    this.name = "";
	    this.wish = "";
	}
};

WishItem.prototype = {
		toString: function () {
			return JSON.stringify(this);
	}
};

var FreezeWishes = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new WishItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

FreezeWishes.prototype = {
    init: function () {
        // todo
    },

    save: function (name, wish) {
        name = name.trim();
        wish = wish.trim();
        if (name === "" || wish === ""){
            throw new Error("empty name / wish");
        }
        if (name.length > 64 || wish.length > 256){
            throw new Error("name / wish exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var wishItem = this.repo.get(name);
        if (wishItem){
            wishItem.wish.push(wish);
        } else {
					wishItem = new WishItem();
					wishItme.author = form;
					wishItem.name = name;
					wishItem.wish.push(wish);

					this.repo.put(name, wishItem);
        }
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.repo.get(name);
    }
};
module.exports = FreezeWishes;