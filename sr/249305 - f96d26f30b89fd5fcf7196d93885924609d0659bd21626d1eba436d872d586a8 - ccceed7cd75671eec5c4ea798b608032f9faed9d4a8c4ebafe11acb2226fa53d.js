"use strict";

var Person = function() {
    this.addr = "";
    this.wishes = new Array();
};

Person.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var MotherDayWish = function() {
    LocalContractStorage.defineMapProperty(this, "wishesRepo");
};

MotherDayWish.prototype = {
    init: function() {
    },

    addWish: function(wish) {
        var fromAddr = Blockchain.transaction.from;
		var person = this.wishesRepo.get(fromAddr);
        if (person) {
            person.wishes.push(wish);
        } else {
            person = new Person();
            person.addr = fromAddr;
            person.wishes.push(wish);
            this.wishesRepo.put(fromAddr, person);
        }
		return person;
    },

    queryWishByAddr: function(addr) {
        return this.wishesRepo.get(addr);
    }
};
module.exports = MotherDayWish;