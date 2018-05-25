"use strict";

// Define Wish
var Wish = function() {
    this.star = "";
    this.words = "";
};

Wish.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var WISHATA = function () {
    //Wish Mapping
    LocalContractStorage.defineMapProperty(this, "wish", {
        parse: function (text) {
            return new Wish(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    
};

WISHATA.prototype = {
    init: function () {
        LocalContractStorage.put('totalwishescount',0);
    },



    AddWish: function (name, star, words) {

        var from = Blockchain.transaction.from;

     
        var wishes = this.wish.get(from);
        if(wishes)
        {

        }else{
            wishes = [];
            var wish = new Wish();
            wish.star = star;
            wish.words = words;
            wishes[0] = wish;
        }

        this.wish.put(from, wish);

        // increase total number of heroClass
        var totalwishescount = LocalContractStorage.get('totalwishescount');
        LocalContractStorage.put("totalwishescount",(totalwishescount + 1));

    },

    getWish: function () {
        var from = Blockchain.transaction.from;
        return this.wish.get(from);
    },

    countTotalWishes: function () {
        return LocalContractStorage.get('totalwishescount');
    }
};
module.exports = WISHATA;