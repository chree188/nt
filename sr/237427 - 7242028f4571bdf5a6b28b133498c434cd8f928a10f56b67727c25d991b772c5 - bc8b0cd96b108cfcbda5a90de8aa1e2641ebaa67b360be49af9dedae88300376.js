'use strict';

var Donor = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.amount = new BigNumber(o.amount);
		this.timestamp = new BigNumber(o.timestamp);
		this.message = new o.message;
		this.from = new o.from
	} else {
		this.amount = new BigNumber(0);
		this.timestamp = new BigNumber(0);
		this.message = "";
		this.from = ""
	}
};
Donor.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var Recipient = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.amount = new BigNumber(o.amount);
		this.timestamp = new BigNumber(o.timestamp);
		this.from = new o.from
	} else {
		this.amount = new BigNumber(0);
		this.timestamp = new BigNumber(0);
		this.from = ""
	}
};
Recipient.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var BankVaultContract = function () {
	LocalContractStorage.defineMapProperty(this, "recipients", {
		parse: function (text) {
			return new Recipient(text);
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
			return new Donor(text);
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
		var donor = new Donor();
			donor.amount = value;
			donor.timestamp = Blockchain.transaction.timestamp;
			if(message)
				donor.message = message
			else 
				donor.message = " "
			donor.from = from

		if (value > 0) {
			this.donorsCount = this.donorsCount.plus(1);
			this.donors.put(from, donor)
			this.donorsLists.set(this.donorsCount, donor);
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

		var value = new BigNumber(parseInt(this.balance / 100))
		var from = Blockchain.transaction.from;
		var timestamp = Date.now()
		var lastTime = new BigNumber(0)
		var	now = new BigNumber(timestamp)
		
		var recipient = this.recipients.get(from);
		if ('undefined' == typeof(recipient) || !recipient) {
			recipient = new Recipient();
		} else {
			lastTime = recipient.timestamp
		}
		if (now - lastTime > 3600) {
			var result = Blockchain.transfer(from, value)
			
			if (result) {
				recipient.amount = value;
				recipient.timestamp = timestamp
				recipient.from = from
				this.balance = this.balance.sub(value)
				this.recipients.put(from, recipient);
				this.recipientsCount = this.recipientsCount.plus(1)
				this.recipientsLists.set(this.recipientsCount, recipient);
				Event.Trigger("giveMeNas", {
					Transfer: {
						from: Blockchain.transaction.to,
						to: from,
						value: recipient.amount.toString()
					}
				});
			}
			return recipient
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
