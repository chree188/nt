"use strict";

var WishWall = function() {
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

WishWall.prototype = {
    init: function() {
        this.size = 0;
    },

    save: function(name, wish) {
        var wishItem = new Object();
        wishItem.name = name;
        wishItem.wish = wish;
        wishItem.author = Blockchain.transaction.from;
        var index = this.size;
        this.dataMap.set(index, JSON.stringify(wishItem));

        this.size += 1;
    },
    get: function(key) {
        return JSON.parse(this.dataMap.get(key));
    },

    len: function() {
        return this.size;
    },

    forEach: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }

        var myArray = [];
        for (var i = offset; i < number; i++) {
            var object = JSON.parse(this.dataMap.get(i));
            myArray.push(object);
        }
        return myArray;
    }
};
module.exports = WishWall;