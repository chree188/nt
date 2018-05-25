"use strict";

var BankVaultContract = function () {};

BankVaultContract.prototype = {

	init: function () {},

	game: function(subscript){
	
		var arr =[1,2,3,4,5,6,7,8,9,10,11,12,13];

		for(var i = 0;i < arr.length; i++){
			var rand = parseInt(Math.random()*arr.length);
			var t = arr[rand];
			arr[rand] =arr[i];
			arr[i] = t;
		}

		return arr[parseInt(subscript)];
	},
};
module.exports = BankVaultContract;