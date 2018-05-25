"use strict";
/**
 * 参与区块链的所有ip
 * @param {*} text 
 */
var IPItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.ip = obj.ip;
	} else {
	    this.ip = "";
	   
	}
};

IPItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var JoinRepo = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new IPItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

JoinRepo.prototype = {
    init: function () {
        // todo
    },

    save: function (key) {

        key = key.trim();
        if (key === ""){
            throw new Error("empty key / value");
        }
        var from = Blockchain.transaction.from;
        var ipItem = this.repo.get(key);
        if (ipItem){
            throw new Error("value has been occupied");
        }

        ipItem = new IPItem();
        ipItem.key = key;
        this.repo.put(key, ipItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = JoinRepo;