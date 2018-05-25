"use strict";

function isAllNaN(str) {
	for (var i = 0; i < str.length; i++) {
		if (str[i] >= 0 && str[i] <= 5) {
			continue;
		}else {
			return false;
		}
	}
    return true;
};

var DiceGameContract = function() {
  LocalContractStorage.defineMapProperty(this, "records");
  LocalContractStorage.defineMapProperty(this, "id_record");
  LocalContractStorage.defineProperty(this, "record_cnt", null);
};

DiceGameContract.prototype = {
  init: function() {
    this.record_cnt = 0;
  },

  dice: function(result, timestamps) {
	var userfrom = Blockchain.transaction.from;
	
	if (result >= 0 && result <= 5) {
		var record = { "inviter": result, "inviter_result": -1,  "partner_result": -1};
		record[userfrom] = 1;
		this.records.set(timestamps, record);
		
		return true;
	}else {
		throw new Error("parameter error!");
	}
  },
  
  guess: function(result, timestamps) {
	var userfrom = Blockchain.transaction.from;
	
	if (result.length !== 3 || !isAllNaN(result)) {
		throw new Error("parameter error!");
	}
	
	var record = this.records.get(timestamps);
	if(!record){
		throw new Error("timestamps error!");
	}else if(record["partner"]){
		throw new Error("PK completed!");
	}
	
	record[userfrom] = 0;
	record["partner"] = result;
	
	console.log("guess() -- 1: " + record[userfrom] + "," + record["inviter"] + "," + record["partner"]);
	
	if(result.indexOf(record["inviter"]) >= 0){
		record["inviter_result"] = 0;
		record["partner_result"] = 1;
	}else{
		record["inviter_result"] = 1;
		record["partner_result"] = 0;
	}
	    
    this.records.set(timestamps, record);
	
	var record_cnt = new BigNumber(this.record_cnt).plus(1);
    this.record_cnt = record_cnt;
	this.id_record.set(this.record_cnt, timestamps);
	
	console.log("guess() -- 2: " + record["inviter"] + "," + record["inviter_result"] + "," + record["partner_result"] + "," + record_cnt);

    return true;
  },
  
  query: function(timestamps) {
	console.log("query() -- 1: " + timestamps);
	
	var record = this.records.get(timestamps);
	if(!record){
		throw new Error("timestamps error!");
	}
	
	var userfrom = Blockchain.transaction.from;
	
	console.log("query() -- 2: " + userfrom + "," + record[userfrom]);
	
	if(record[userfrom]){
		return {"result": record["inviter_result"]};
	}else{
		return {"result": record["partner_result"]};
	}
  }, 
  
  queryEx: function(inviterFlag, timestamps) {
	  console.log("query() -- 1: " + timestamps);
	
	var record = this.records.get(timestamps);
	if(!record){
		throw new Error("timestamps error!");
	}
	
	var userfrom = Blockchain.transaction.from;
	
	console.log("query() -- 2: " + userfrom + "," + record[userfrom]);
	
	if(inviterFlag){
		return {"result": record["inviter_result"]};
	}else{
		return {"result": record["partner_result"]};
	}
  }
  
};

module.exports = DiceGameContract;