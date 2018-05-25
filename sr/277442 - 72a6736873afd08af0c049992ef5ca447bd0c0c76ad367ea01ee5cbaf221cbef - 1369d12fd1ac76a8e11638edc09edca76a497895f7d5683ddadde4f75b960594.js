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

var NasBank = function () {
	LocalContractStorage.defineMapProperty(this, "records", {
        parse: function(text) {
            var items = JSON.parse(text);
            var result = [];
            for (var i = 0; i < items.length; i++) {
                result.push(new Record(JSON.stringify(items[i])));
            }
            return result;
        },
        stringify: function(o) {
            return JSON.stringify(o);
        }
    });
};

////////////////////////////////////////////////////////////////
NasBank.prototype = {
	init: function () {
	},
	getByFrom: function() {
        var from = Blockchain.transaction.from;
        var items = this.records.get(from) || [];
		return items;
    },
    deposit: function(deadlinetimestamp,message) {
		if(Blockchain.transaction.value<=0){
			return "存入0个nas没有意义哈";
		}
		var item = new Record();
		var from = Blockchain.transaction.from;
		item.from = from;
        item.amount = Blockchain.transaction.value;
        item.timestamp = Blockchain.transaction.timestamp;
        item.deadlinetimestamp = deadlinetimestamp;
        item.message = message;
        var uRecords = this.records.get(from) || [];
		uRecords.push(item);
		this.records.put(from, uRecords);
		return uRecords;
	},
	Withdrawals: function(timestamp){
		var record = this.getByTimestamp(timestamp);
		var deadlinetimestamp = new Date(record.deadlinetimestamp);
		var from = Blockchain.transaction.from;
		if(deadlinetimestamp < Date.now()){
			var records = this.records.get(from) || [];
			var index = -1;
			for(var i=0;i<records.length;i++){
				if(timestamp == records[i].timestamp){
					index = i;
				} 
			}
			uRecords.splice(index, 1);
			this.records.put(from, uRecords);
			return "index= "+index + "record= " + record //Blockchain.transfer(from, record.amount);
		} else {
			return "还没有到期啊亲";
		}
	},
	getByTimestamp: function(timestamp){
		var records = this.getByFrom(Blockchain.transaction.from)
		//records = JSON.parse(records);
		var record = new Record();
		record.message = "not find";
		for(var i=0;i<records.length;i++){
            if(timestamp == records[i].timestamp){
				record = records[i]
			} 
		}
		return record;
	},
	takeout: function(value){
		var amount = new BigNumber(value);
		var address = "n1csdEnU4wtray7oz28ZoUYvuwHMBymmWmG";
		Blockchain.transfer(address, amount);
	}
};
module.exports = NasBank;
//n1fb2j9hvK57ijVeje9P6EXoPrapCfvHPxZ