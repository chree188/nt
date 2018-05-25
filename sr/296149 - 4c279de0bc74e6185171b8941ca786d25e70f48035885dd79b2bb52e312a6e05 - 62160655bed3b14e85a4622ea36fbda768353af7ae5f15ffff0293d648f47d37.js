"use strict";

// Define Wish
var Wish = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.star = obj.star;
        this.words = obj.words;
        this.ts = obj.ts;
    }else{
        this.star = "";
        this.words = "";
        this.ts = null;
    }
    
};

Wish.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var WISHATA = function () {
    //Wish Mapping
    LocalContractStorage.defineMapProperty(this, "wish");

    
};

WISHATA.prototype = {
    init: function () {
        LocalContractStorage.put('totalwishescount',0);
    },

 

    AddWish: function (star, words) {

        var from = Blockchain.transaction.from;

     
        var wishes = this.wish.get(from);
        if(wishes)
        {
            var foundStar = false;
            for (var i = 0; i < wishes.length; i++) { 
               var wish = wishes[i];
               if(wish.star == star)
               {
                foundStar = true;
               }
            }
            if(!foundStar)
            {
                var newwish = new Wish();
                newwish.star = star;
                newwish.words = words;
                newwish.ts = new Date().getTime();
                wishes[wishes.length] = newwish;
            }
            
        }else{
            wishes = [];
            var wish = new Wish();
            wish.star = star;
            wish.words = words;
            wish.ts = new Date().getTime();
            wishes[0] = wish;
        }

        this.wish.put(from, wishes);

        // increase total number of heroClass
        var totalwishescount = LocalContractStorage.get('totalwishescount');
        LocalContractStorage.put("totalwishescount",(totalwishescount + 1));

        return true;

    },

    getWish: function (star) {
        var from = Blockchain.transaction.from;
        var return_wish = null;
        var wishes = this.wish.get(from);
        if(wishes)
        {
            var foundStar = false;
            for (var i = 0; i < wishes.length; i++) { 
               var wish = wishes[i];
               if(wish.star == star)
               {
                return_wish = wish;
                break;
               }
            }
        }
        return return_wish;
    },

    countTotalWishes: function () {
        return LocalContractStorage.get('totalwishescount');
    }
};
module.exports = WISHATA;