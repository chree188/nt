"use strict";

function checkInput(str) {
	for (var i = 0; i < str.length; i++) {
		if (str[i] >= 0 && str[i] <= 5) {
			continue;
		}else {
			return false;
		}
	}
    return true;
};

function RandomNum(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
};

var DiceGuessContractV1 = function() {
  LocalContractStorage.defineMapProperty(this, "dice_records");
  LocalContractStorage.defineMapProperty(this, "id_dice_record");
  LocalContractStorage.defineProperty(this, "dice_record_cnt", null);
};

DiceGuessContractV1.prototype = {
  init: function() {
    this.dice_record_cnt = 0;
  },

  dice: function(input, dice_id) {
	var userfrom = Blockchain.transaction.from;
	
	console.log("dice() -- 1: " + userfrom + "," + input + "," + dice_id);
	
	if (!checkInput(input)){
		throw new Error("input error!");
	}
	
	var dice_record = this.dice_records.get(dice_id);
	if (dice_record) {
		throw new Error("dice_id error!");
	}
	
	var userresult = 0;
	var computer_input = RandomNum(0,5).toString();
	if (input.indexOf(computer_input) > 0) {
		userresult = 1;
	}
	
    dice_record = { "from": userfrom, "user": input, "computer": computer_input, "userresult": userresult};
    
    this.dice_records.set(dice_id, dice_record);
	
	var dice_record_cnt = new BigNumber(this.dice_record_cnt).plus(1);
    this.dice_record_cnt = dice_record_cnt;
	this.id_dice_record.set(this.dice_record_cnt, dice_id);
	
	console.log("dice() -- 2: " + dice_id + "," + computer_input + "," + userresult + "," + dice_record_cnt);

    return true;
  },
  
  queryResult: function(dice_id) {
	var dice_record = this.dice_records.get(dice_id);
	var userfrom = Blockchain.transaction.from;
	if(!dice_record || dice_record.from !== userfrom){
		throw new Error("dice_id error!");
	}
	
    return dice_record;
  }, 
  
};

module.exports = DiceGuessContractV1;