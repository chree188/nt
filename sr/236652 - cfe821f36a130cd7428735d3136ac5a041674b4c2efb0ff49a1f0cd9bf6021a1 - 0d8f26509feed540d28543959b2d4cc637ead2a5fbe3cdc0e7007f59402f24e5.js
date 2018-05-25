'use strict';

var DepositeContent = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.amount = new BigNumber(o.amount);
		this.timestamp = new o.timestamp;
		this.message = new o.message;
	} else {
		this.amount = new BigNumber(0);
		this.timestamp = "";
		this.message = "";
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
    LocalContractStorage.defineMapProperty(this, "recipientsLists");
    LocalContractStorage.defineProperty(this, "recipientsCount", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
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
	LocalContractStorage.defineMapProperty(this, "donorsLists");
	LocalContractStorage.defineMapProperty(this, "donorsTopTen");
	LocalContractStorage.defineProperty(this, "donorsCount", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
        }
    });

	LocalContractStorage.defineProperty(this, "balance", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new BigNumber(str);
        }
    });
    
};

// save value to contract, only after height of block, users can takeout
BankVaultContract.prototype = {
	init: function () {
		this.balance = new BigNumber(0)
		this.recipientsCount = new BigNumber(0)
		this.donorsCount = new BigNumber(0)
	},
	getBalance: function(){
		return this.balance
	},

	donation: function (message) {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var donor = new DepositeContent();
			donor.amount = value;
			donor.timestamp = Blockchain.transaction.timestamp;
			donor.message = message

		if (value > 0) {
			this.donorsCount = this.donorsCount.plus(1);
			this.donors.put(from, donor)
			this.donorsLists.set(this.donorsCount,donor);
			this.balance = this.balance.plus(value)

        	for (var i = 0; i < 10; i++) {
            	var o_donor = this.donorsTopTen.get(i);
            	if (o_donor) {
            		if (donor.amount > o_donor.amount) {
                		this.donorsTopTen.set(i, donor);
                		donor = o_donor;
            		}
            	} else {
            		this.donorsTopTen.set(i, donor);
            		break;
            	}
        	}
		}
		return donor
	},

	getDonorsTopTen: function() {
        var rankList = [];
        for (var i = 0; i < 10; i++) {
            var donor = this.donorsTopTen.get(i);
            if (donor) {
                rankList.push(donor);
            } else { break; }
        }
        return rankList;
    },
    
  	getDonorsRecently: function(count) {
    	var messages = []
    	var messageCount = +this.donorsCount

    	if (!count) count = 10
    	if (count > messageCount) count = messageCount
    
    	for (var i = 1; messageCount >= i && count >= i; i++) {
      		messages.push(this.donorsLists.get(messageCount - count + i))
    	}

    	return messages
  	},
	
	giveMeNas: function(){

		var value1 = new BigNumber(100);// new BigNumber(parseInt(this.balance / 100))

		var from = Blockchain.transaction.from;
		var user = this.recipients.get(from);
		var timestamp = Date.now()
		var lastTime = new BigNumber(0)
		var	now = new BigNumber(timestamp)
		user = new DepositeContent();
		/*
		if ('undefined' == typeof(user) || !user) {
			user = new DepositeContent();
		} else {
			lastTime = new BigNumber(user.timestamp)
		}*/
		if (now - lastTime > 3600) {
			var result = Blockchain.transfer(from, value1)
			if (result) {
				user.amount = value1;
				user.timestamp = timestamp
				user.message = ""
				this.balance = this.balance.sub(value1)
				this.recipients.put(from, user);
				this.recipientsCount = this.recipientsCount.plus(1)
				this.recipientsLists.set(this.recipientsCount, user);
				Event.Trigger("BankVault", {
					Transfer: {
						from: Blockchain.transaction.to,
						to: from,
						value: amount.toString()
					}
				});
			}
			return result
		} else {
			return "wait please"
		}
	},
	getRecipientsRecently: function(count) {
    	var messages = []
    	var messageCount = +this.recipientsCount

    	if (!count) count = 10
    	if (count > messageCount) count = messageCount
    
    	for (var i = 1; messageCount >= i && count >= i; i++) {
      		messages.push(this.recipientsLists.get(messageCount - count + i))
    	}

    	return messages
  	}
	
	/*
	takeout: function(value) {
		var amount = parseInt(value);
		var from = "n1ZMgPFTkQBmrkHqHa5251f4uNX1m4UrXga"
		var result = _takeout(from, amount);
		return result
	}
	/*
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
//n1syLAthAGEegYoooqBPc3ZAGSGq9zjTkb2
//554fd5f30b4f2272f3799c62cce50081638ce8cc8bf1fec69b10c58663297e17
