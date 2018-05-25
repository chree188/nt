"use strict";

var ForgiveContractV1 = function() {
	LocalContractStorage.defineMapProperty(this, "forgive_records");
	LocalContractStorage.defineProperty(this, "forgive_record_cnt", null);
	
	LocalContractStorage.defineMapProperty(this, "forgive_authors");
	LocalContractStorage.defineMapProperty(this, "id_forgive_author");
	LocalContractStorage.defineProperty(this, "forgive_author_cnt", null);		
};

ForgiveContractV1.prototype = {
	init: function() {
		this.forgive_record_cnt = 0;
		this.forgive_author_cnt = 0;
	},
	
	pushMyForgiveDiary: function(myForgiveDiary) {
		if (!myForgiveDiary) {
			return new Error("Parameter Error!");
		} else if (!myForgiveDiary["detail"] || myForgiveDiary["detail"].trim() === "") {
			return new Error("Parameter Error!");
		}
		
		var forgive_record_cnt = new BigNumber(this.forgive_record_cnt).plus(1);
		this.forgive_record_cnt = forgive_record_cnt;
				
		var user = Blockchain.transaction.from;
		var records = this.forgive_authors.get(user);
		if (!records) {
			records = [];
			
			var forgive_author_cnt = new BigNumber(this.forgive_author_cnt).plus(1);
			this.forgive_author_cnt = forgive_author_cnt;
			this.id_forgive_author.set(forgive_author_cnt, user);
		}
		records.push(forgive_record_cnt);
		this.forgive_authors.set(user, records);		
		
		myForgiveDiary["order"] = records.length;
		myForgiveDiary["date"] = this._getCurrentDate();
		this.forgive_records.set(forgive_record_cnt, myForgiveDiary);
	},
	
	pullMyForgiveDiary: function(order) {
		var user = Blockchain.transaction.from;
		var records = this.forgive_authors.get(user);
		if (!records || records.length < 1) {
			return null;
		}
		
		order = parseInt(order);
		if (order > records.length) {
			order = records.length;
		}
		
		var record_index = records[order - 1];
		return this.forgive_records.get(record_index);
	},
	
	listMyForgiveDiary: function(count) {
		var user = Blockchain.transaction.from;
		var records = this.forgive_authors.get(user);
		
		var result = [];
		if (!records || records.length < 1) {
			return result;
		}
		
		count = parseInt(count);
		if (count === 0) {
			count = 1;
		} else if (count > records.length) {
			count = records.length;
		}
		
		for (var record_index = records.length - 1; record_index >= 0 && count > 0; record_index--, count--) {
			result.push(this.forgive_records.get(records[record_index]));
		}
		
		return result;
	},
	
	_getCurrentDate: function() {
		var date = new Date();		
		var month = date.getMonth() + 1;
		var day = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (day >= 0 && day <= 9) {
			day = "0" + day;
		}
		
		return date.getFullYear() + "-" + month + "-" + day;
	},
};

module.exports = ForgiveContractV1;