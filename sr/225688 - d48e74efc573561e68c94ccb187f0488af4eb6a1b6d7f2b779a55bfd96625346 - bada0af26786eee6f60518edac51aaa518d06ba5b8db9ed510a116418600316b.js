"use strict";

var BankVaultContract = function () {};

BankVaultContract.prototype = {
	init: function () {},
	
	test: function(){
		var d = new Date();
		return d.toString();
	}
};

module.exports = BankVaultContract;