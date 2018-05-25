'use strict';

var DepositeContent = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.balance = new BigNumber(o.balance);
		
	} else {
		this.balance = new BigNumber(0);
		
	}
};

DepositeContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BankVaultContract = function () {
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
BankVaultContract.prototype = {
	init: function () {
		var deposit = new DepositeContent();
		LocalContractStorage.set("vault", deposit);
	},
	play: function () {
	    var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var bet ;
		var remainder = new BigNumber(0);
		if (value > 100000000000000000) { // 0.1 NAS
          bet = new BigNumber(100000000000000000);
          remainder = value.minus(bet);
		} else {
			bet = new BigNumber(value);
		}

		var random = Math.floor(Math.random() * 100) + 1;
   
		if (random <=51) {
			var toSend = bet * 2;
			var result =Blockchain.transfer(from, toSend);
			if (!result) {
			throw new Error("transfer failed.");
		}
			return "Your chance " + random + "you win " + toSend;	
		} 
	    else { 

		  //var deposit = LocalContractStorage.get("vault");
		  //deposit.balance = deposit.balance.plus(bet);
		  //LocalContractStorage.set("vault", deposit);
          return  "Your chance " +random + "you loss " + bet;
		}

	},
	save: function () {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var deposit = LocalContractStorage.get("vault"); 
		deposit.balance = deposit.balance +value;
		LocalContractStorage.set("vault", deposit);
		//LocalContractStorage.set(from, vault);
		//this.bankVault.put(from, deposit);
	},

	takeout: function (value) {
		var from = Blockchain.transaction.from;
		var amount = new BigNumber(value);
        var deposit = LocalContractStorage.get("vault"); 
		if (amount.gt(deposit.balance)) {
			throw new Error("Insufficient balance.");
		}

		var result = Blockchain.transfer(from, amount);
		if (!result) {
			throw new Error("transfer failed.");
		}
		Event.Trigger("BankVault", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: from,
				value: amount.toString()
			}
		});

		deposit.balance = deposit.balance - amount;
		LocalContractStorage.set("vault", deposit);//
		return deposit;
	},
	balanceOf: function () {
		
		return LocalContractStorage.get("vault"); 
	},
	verifyAddress: function (address) {
		// 1-valid, 0-invalid
		var result = Blockchain.verifyAddress(address);
		return {
			valid: result == 0 ? false : true
		};
	}
};
module.exports = BankVaultContract;