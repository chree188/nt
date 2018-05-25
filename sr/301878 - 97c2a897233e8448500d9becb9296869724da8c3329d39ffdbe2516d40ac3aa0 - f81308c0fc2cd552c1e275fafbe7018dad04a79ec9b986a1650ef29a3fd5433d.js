"use strict";

var MemorialDayContractV1 = function() {
	LocalContractStorage.defineMapProperty(this, "memorialEvents");
	LocalContractStorage.defineProperty(this, "memorialEventCount", null);
	
	LocalContractStorage.defineMapProperty(this, "memorialEventAuthors");
	LocalContractStorage.defineMapProperty(this, "idMemorialEventAuthor");
	LocalContractStorage.defineProperty(this, "memorialEventAuthorCount", null);		
};

MemorialDayContractV1.prototype = {
	init: function() {
		this.memorialEventCount = 0;
		this.memorialEventAuthorCount = 0;
	},
	
	newMemorialEvent: function(memorial_event) {
		if (!memorial_event) {
			return new Error("parameter error!");
		}
		
		var memorialEventCount = new BigNumber(this.memorialEventCount).plus(1);
		this.memorialEventCount = memorialEventCount;
				
		var user = Blockchain.transaction.from;
		var records = this.memorialEventAuthors.get(user);
		if (!records) {
			records = [];
			
			var memorialEventAuthorCount = new BigNumber(this.memorialEventAuthorCount).plus(1);
			this.memorialEventAuthorCount = memorialEventAuthorCount;
			this.idMemorialEventAuthor.set(memorialEventAuthorCount, user);
		}
		records.push(memorialEventCount);
		this.memorialEventAuthors.set(user, records);		
		
		memorial_event["id"] = records.length;
		this.memorialEvents.set(memorialEventCount, memorial_event);
	},
	
	getMemorialEventCount: function() {
		var user = Blockchain.transaction.from;
		var records = this.memorialEventAuthors.get(user);
		if (!records) {
			return 0;
		}
		
		return records.length;
	},
	
	getMemorialEventDetail: function(id) {
		var user = Blockchain.transaction.from;
		var records = this.memorialEventAuthors.get(user);
		if (!records || records.length < 1) {
			return null;
		}
		
		id = parseInt(id);
		if (id > records.length) {
			id = records.length;
		}
		
		var record_index = records[id - 1];
		return this.memorialEvents.get(record_index);
	},
	
	listMemorialEvent: function(start, end) {
		var user = Blockchain.transaction.from;
		var records = this.memorialEventAuthors.get(user);
		
		var result = [];
		if (!records || records.length < 1) {
			return result;
		}
		
		var maxIndex = records.length - 1;
		if (start > maxIndex) {
			return new Error("parameter error!");
		}
		
		if (start < 1) {
			start = 0;
		}
		
		if (end < 1 || end > maxIndex) {
			end = maxIndex;
		}
			
		for (var record_index = maxIndex - start; record_index >= maxIndex - end; record_index--) {
			result.push(this.memorialEvents.get(records[record_index]));
		}
		
		return result;
	},
};

module.exports = MemorialDayContractV1;