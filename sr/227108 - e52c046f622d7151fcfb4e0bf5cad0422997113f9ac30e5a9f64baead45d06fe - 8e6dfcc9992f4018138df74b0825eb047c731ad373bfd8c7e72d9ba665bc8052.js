"use strict";

var FingerGuessContract = function() {
  LocalContractStorage.defineMapProperty(this, "game");
  LocalContractStorage.defineMapProperty(this, "id_game");
  LocalContractStorage.defineProperty(this, "game_cnt", null);
};

FingerGuessContract.prototype = {
  init: function() {
    this.game_cnt = 0;
  },

  inviter: function(user_fist, timestamps) {
	var userfrom = Blockchain.transaction.from;
	
	console.log("inviter() --- 1: " + user_fist + "," + timestamps + "," + userfrom);
	
	if (user_fist !== 1 && user_fist !== 2 && user_fist != 3){
		throw new Error("Fist error!");
	}
	
    var game_info = { "inviter": user_fist, "inviter_result": -1,  "partner_result": -1};
	
	game_info[userfrom] = 1;
	
	console.log("inviter() --- 2: " + game_info[userfrom]);
    
    this.game.set(timestamps, game_info);

    return true;
  },
  
  partner: function(user_fist, timestamps) {
	var userfrom = Blockchain.transaction.from;
	
	console.log("partner() -- 1: " + user_fist + "," + timestamps + "," + userfrom);
	
	if (user_fist !== 1 && user_fist !== 2 && user_fist != 3){
		throw new Error("Fist error!");
	}
	
	var game_info = this.game.get(timestamps);
	if(!game_info){
		throw new Error("timestamps error!");
	}else if(game_info["partner"]){
		throw new Error("PK completed!");
	}
	
	console.log("partner() -- 2: " + game_info["partner"]);
	
	game_info[userfrom] = 0;
	game_info["partner"] = user_fist;
	
	console.log("partner() -- 3: " + game_info[userfrom]);
	
	var inviter_fist = game_info["inviter"];
	if(inviter_fist==1&&user_fist==3||inviter_fist==2&&user_fist==1||inviter_fist==3&&user_fist==2){
		game_info["inviter_result"] = 2;
		game_info["partner_result"] = 0;
	}else if(inviter_fist==3&&user_fist==1||inviter_fist==1&&user_fist==2||inviter_fist==2&&user_fist==3){
		game_info["inviter_result"] = 0;
		game_info["partner_result"] = 2;
	}else{
		game_info["inviter_result"] = 1;
		game_info["partner_result"] = 1;
	}
	    
    this.game.set(timestamps, game_info);
	
	var game_cnt = new BigNumber(this.game_cnt).plus(1);
    this.game_cnt = game_cnt;
	this.id_game.set(this.game_cnt, game_info);
	
	console.log("partner() -- 4: " + inviter_fist + "," + game_info["inviter_result"] + "," + game_info["partner_result"] + "," + game_cnt);

    return true;
  },
  
  queryResult: function(timestamps) {
	console.log("queryResult() -- 1: " + timestamps);
	
	var game_info = this.game.get(timestamps);
	if(!game_info){
		throw new Error("timestamps error!");
	}
	
	var userfrom = Blockchain.transaction.from;
	
	console.log("queryResult() -- 2: " + userfrom + "," + game_info[userfrom]);
	
	if(game_info[userfrom]){
		return {"result": game_info["inviter_result"]};
	}else{
		return {"result": game_info["partner_result"]};
	}
  }, 
  
};

module.exports = FingerGuessContract;