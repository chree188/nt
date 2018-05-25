'use strict';

var Record = function (text) {
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
Record.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var Records = function() {
    this.items = [];
};

var BankVaultContract = function () {
    LocalContractStorage.defineMapProperty(this, "records",{
		stringify: function (obj) {
            return JSON.stringify(obj)
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
		var item = new Record();
		var from = Blockchain.transaction.from;
		item.from = from;
        item.amount = amount;
        item.timestamp = new Date(timestamp);
        item.deadlinetimestamp = new Date(deadlinetimestamp);
        item.message = message;

        var uRecords = this.records.get(from);
        if (!uRecords) {
            uRecords = new Records();
		}
		uRecords.items.push(item);
		//uRecords = JSON.stringify(uRecords);
		this.records.set(from, uRecords);
		return uRecords;
	},
	Withdrawals: function(timestamp){
		var record = this.getByTimestamp(timestamp);
		if(timestamp.lessthan(Date.now())){
			Blockchain.transfer(Blockchain.transaction.from,record.amount);
		}
	},
	getByTimestamp: function(timestamp){
		var records = this.getByFrom(Blockchain.transaction.from)
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