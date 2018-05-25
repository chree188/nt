"use strict";

function RandomNum(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
};

var FingerGuessContract = function() {
  LocalContractStorage.defineMapProperty(this, "game");
  LocalContractStorage.defineMapProperty(this, "id_game");
  LocalContractStorage.defineProperty(this, "game_cnt", null);
};

FingerGuessContract.prototype = {
  init: function() {
    this.game_cnt = 0;
  },

  userResult: function(user_fist, game_id) {
	var userfrom = Blockchain.transaction.from;
	
	console.log("userResult() -- 1: " + user_fist + "," + userfrom);
	
	if (user_fist !== 1 && user_fist !== 2 && user_fist != 3){
		throw new Error("user_fist error!");
	}
	
	var game_info = this.game.get(game_id);
	if (game_info) {
		throw new Error("game_id error!");
	}
	
	var userresult = 1;
	var computer_fist = RandomNum(1,3);
	if(user_fist==1&&computer_fist==3||user_fist==2&&computer_fist==1||user_fist==3&&computer_fist==2){
		userresult = 2;
	}else if(user_fist==3&&computer_fist==1||user_fist==1&&computer_fist==2||user_fist==2&&computer_fist==3){
		userresult = 0;
	}
	
    game_info = { "from": userfrom, "user": user_fist, "computer": computer_fist, "result": userresult};
    
    this.game.set(game_id, game_info);
	
	var game_cnt = new BigNumber(this.game_cnt).plus(1);
    this.game_cnt = game_cnt;
	this.id_game.set(this.game_cnt, game_id);
	
	console.log("userResult() -- 2: " + game_id + "," + computer_fist + "," + userresult + "," + game_cnt);

    return true;
  },
  
  queryResult: function(game_id) {
	var game_info = this.game.get(game_id);
	var userfrom = Blockchain.transaction.from;
	if(!game_info || game_info.from !== userfrom){
		throw new Error("game_id error!");
	}
	
    return game_info;
  }, 
  
};

module.exports = FingerGuessContract;