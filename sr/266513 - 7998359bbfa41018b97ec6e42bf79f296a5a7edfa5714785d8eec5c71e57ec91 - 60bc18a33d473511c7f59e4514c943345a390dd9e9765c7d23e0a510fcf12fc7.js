'use strict';

var record = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.amount = new BigNumber(o.amount);
		this.timestamp = o.timestamp;
		this.deadlinetimestamp = o.deadlinetimestamp;
		this.message = o.message;
		this.from = o.from;
	} else {
		this.amount = new BigNumber(0);
		this.timestamp = new Date();
		this.deadlinetimestamp = new Date();
		this.message = "";
		this.from = "";
	}
};
record.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var BankVaultContract = function () {
    LocalContractStorage.defineMapProperty(this, "records",{
		stringify: function (obj) {
            return JSON.stringify(obj);
        },
        parse: function (str) {
            return JSON.parse(str);
        }
	});
};
////////////////////////////////////////////////////////////////
BankVaultContract.prototype = {
	init: function () {
	},
	getByFrom: function() {
        var from = Blockchain.transaction.from;
        var items = this.records.get(from);
        return items;
    },
    deposit: function(amount,timestamp,deadlinetimestamp,message) {
        var from = Blockchain.transaction.from;
        var item = new record();
        item.amount = amount;
        item.timestamp = timestamp;
        item.deadlinetimestamp = deadlinetimestamp;
        item.message = message;

        var uRecords = this.records.get(from);
        if (!uRecords) {
            uRecords.items = [];
        }
        uRecords.items.push(item);
        this.records.set(from, uRecords);
	},
	Withdrawals: function(timestamp){
		var record = this.getByTimestamp(timestamp);
		if(timestamp.lessthan(Date.now())){
			Blockchain.transfer(Blockchain.from,record.amount);
		}
	},
	getByTimestamp: function(timestamp){
		var records = this.getByFrom(this.Blockchain.from)
		for(var i=0;i<records.items.length;i++){
			var record = records.items[i]
            if(timestamp === record.timestamp)
			  return record;
			  break;
        }
	},
	takeout: function(value){
		var amount = new BigNumber(value);
		var address = "n1csdEnU4wtray7oz28ZoUYvuwHMBymmWmG";
		if(amount<this.balance){
			var result = Blockchain.transfer(address, amount);
			this.balance = this.balance.sub(amount);
			return result;
		} else {
			return "takeout too much";
		}
	}
};
module.exports = BankVaultContract;