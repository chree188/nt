"use strict";

var DepositeContent = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.balance = new BigNumber(o.balance);
		this.expiryHeight = new BigNumber(o.expiryHeight);
	} else {
		this.balance = new BigNumber(0);
		this.expiryHeight = new BigNumber(0);
	}
};

DepositeContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var HitMouse = function () {
	LocalContractStorage.defineMapProperty(this, "bankVault", {
		parse: function (text) {
			return new DepositeContent(text);
		},
		stringify: function (o) {
			return o.toString();
		}
	});
};

// save value to contract, only after height of block, users can takeout
HitMouse.prototype = {
	init: function () {
		//TODO:
	},

	saveScore: function(max_score){
		var from = Blockchain.transaction.from;
		this.bankVault.put(from, max_score);
	},
	getScore: function(){
		var from = Blockchain.transaction.from;
		return this.bankVault.get(from);
	}
};

module.exports = HitMouse;