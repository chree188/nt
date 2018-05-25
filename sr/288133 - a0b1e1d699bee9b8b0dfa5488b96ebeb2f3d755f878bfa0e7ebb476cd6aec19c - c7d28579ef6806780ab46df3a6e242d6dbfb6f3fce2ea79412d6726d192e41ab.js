"use strict";

var Player = function() { 
    this.address = "";
	this.win = 0;
	this.nickName = "";
};


var Ranklist = function () {
    LocalContractStorage.defineMapProperty(this, "rank");
    LocalContractStorage.defineMapProperty(this, "addressMap");
    LocalContractStorage.defineProperty(this, "ranksize");
};

Ranklist.prototype = {
    init: function() {
        this.ranksize = 0;
    },

    login: function() {
        
        var from = Blockchain.transaction.from;
        var player = this.rank.get(from);
        if (!player) {
            player = new Player();
            player.address = from;
            this.addressMap.set(this.ranksize, from);
            this.rank.set(from, player);
            this.ranksize += 1;
        }
    },

    get: function(address) {
        address = address.trim();
        if(address == ""){
            return new Error("empty address");
        }
        
        return this.rank.get(address);
    },

    update: function (address) { 
        var from = Blockchain.transaction.from;
        if (address != from) {
            return new Error("user doesn't login");
        }
        var player = this.rank.get(address);
        if (!player) {
            return new Error("user doesn't exist");
        }
        player.win += 1;
        this.rank.set(from, player);
    },

    rankAll: function() {
        var result = [];
        for(var i = 0; i<this.ranksize; i++) {
            var address = this.addressMap.get(i);
            var player = this.rank.get(address);
            result.push(player);
        }
        return result;
    }
};

module.exports = Ranklist;