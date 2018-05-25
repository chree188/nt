'use strict';

var DepositeContent = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.amount = new BigNumber(o.amount);
		this.timeStample = new o.timeStample;
	} else {
		this.amount = new BigNumber(0);
		this.timeStample = "";
	}
};

DepositeContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BankVaultContract = function () {
	LocalContractStorage.defineMapProperty(this, "recipients", {
		parse: function (text) {
			return new DepositeContent(text);
		},
		stringify: function (o) {
			return o.toString();
		}
	});
	LocalContractStorage.defineMapProperty(this, "donors", {
		parse: function (text) {
			return new DepositeContent(text);
		},
		stringify: function (o) {
			return o.toString();
		}
	});
};

// save value to contract, only after height of block, users can takeout
BankVaultContract.prototype = {
	init: function () {
		//TODO:
	},

	donation: function () {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		if (value > 0) {
			var donor = new DepositeContent();
			donor.amount = value;
			donor.timeStample = Date.Now().toString();
			this.donors.put(from,donor)
		}
		return donor
	},
	/*
	_takeout: function (from,value) {
		
		var result = Blockchain.transfer(Blockchain.transaction.from, vaule);
		if (result) {
			var user = new DepositeContent();
			user.amount = value;
			user.timeStample = Date.Now().toString();
			this.recipients.put(from,user);
		}
		Event.Trigger("BankVault", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: from,
				value: amount.toString()
			}
		});
		return result
	},
	
	giveMoney: function(){
		var vaule = parseInt(Math.random()*100000);
		var from = Blockchain.transaction.from;

		var user = this.recipients.get(from);
		var nowstring = Date.Now().toString();
		var lastTime = new BigNumber(0), now = new BigNumber(nowstring.substring(nowstring.length-13))
		if(user){
			lastTime = new BigNumber(user.timeStample.substring(user.timeStample.substring.length-13)) 
		}

		if (now - lastTime > 60*60*1000) {
				var result = _takeout(from, vaule);
				if (result) {
					this.recipients.set(Blockchain.transfer.from, value,Date.now().toString();
					return result
				} else {
					return "err"
				}
		} else {
			return "wait"
		}
	}
	
	iNeedMoney: function(value) {
		var amount = new BigNumber(value);
		var result =takeout("n1ZMgPFTkQBmrkHqHa5251f4uNX1m4UrXga",amount);
		return result
	}
	verifyAddress: function (address) {
		// 1-valid, 0-invalid
		var result = Blockchain.verifyAddress(address);
		return {
			valid: result == 0 ? false : true
		};
	},
	*/
};
module.exports = BankVaultContract;
//TX Hash	e38f85c94db152c3bbc5d872c1e74d048824af0d1143bcb0720cadc215934967
//Contract address	n1jpS645fe6AVJPL42GWyRwLMjFH3cC2jq2

// n1kCec5yx5NFhqbToKqqo1YsrpLuE9LWQGN  //incloud balanceOfsth

//n1r8posAhdBVSdeHxXRuxLrkYT1FMLbfBag //adm