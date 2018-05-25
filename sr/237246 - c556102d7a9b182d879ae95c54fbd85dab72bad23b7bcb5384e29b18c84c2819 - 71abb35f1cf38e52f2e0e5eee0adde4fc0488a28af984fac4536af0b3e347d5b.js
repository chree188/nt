"use strict";

var CoinGameContract = function() {
  LocalContractStorage.defineMapProperty(this, "coins");
  LocalContractStorage.defineMapProperty(this, "id_coin");
  LocalContractStorage.defineProperty(this, "coin_cnt", null);
};

CoinGameContract.prototype = {
  init: function() {
    this.coin_cnt = 0;
  },

  coin_inviter: function(result, timestamps) {
	var userfrom = Blockchain.transaction.from;
	
	console.log("coin_inviter() --- 1: " + result + "," + userfrom + "," + timestamps);
	
	if (result !== 0 && result !== 1){
		throw new Error("result error!");
	}
	
    var coin_info = { "inviter": result, "inviter_result": -1,  "partner_result": -1};
	
	coin_info[userfrom] = 1;
	
	console.log("coin_inviter() --- 2: " + coin_info[userfrom]);
    
    this.coins.set(timestamps, coin_info);

    return true;
  },
  
  conin_partner: function(result, timestamps) {
	var userfrom = Blockchain.transaction.from;
	
	console.log("conin_partner() -- 1: " + result + "," + userfrom + "," + timestamps);
	
	if (result !== 0 && result !== 1){
		throw new Error("result error!");
	}
	
	var coin_info = this.coins.get(timestamps);
	if(!coin_info){
		throw new Error("timestamps error!");
	}else if(coin_info["partner"]){
		throw new Error("PK completed!");
	}
	
	coin_info[userfrom] = 0;
	coin_info["partner"] = result;
	
	console.log("conin_partner() -- 2: " + coin_info[userfrom] + "," + coin_info["inviter"] + "," + coin_info["partner"]);
	
	if(result === coin_info["inviter"]){
		coin_info["inviter_result"] = 0;
		coin_info["partner_result"] = 1;
	}else{
		coin_info["inviter_result"] = 1;
		coin_info["partner_result"] = 0;
	}
	    
    this.coins.set(timestamps, coin_info);
	
	var coin_cnt = new BigNumber(this.coin_cnt).plus(1);
    this.coin_cnt = coin_cnt;
	this.id_coin.set(this.coin_cnt, timestamps);
	
	console.log("conin_partner() -- 3: " + coin_info["inviter"] + "," + coin_info["inviter_result"] + "," + coin_info["partner_result"] + "," + coin_cnt);

    return true;
  },
  
  queryResult: function(timestamps) {
	console.log("queryResult() -- 1: " + timestamps);
	
	var coin_info = this.coins.get(timestamps);
	if(!coin_info){
		throw new Error("timestamps error!");
	}
	
	var userfrom = Blockchain.transaction.from;
	
	console.log("queryResult() -- 2: " + userfrom + "," + coin_info[userfrom]);
	
	if(coin_info[userfrom]){
		return {"result": coin_info["inviter_result"]};
	}else{
		return {"result": coin_info["partner_result"]};
	}
  }, 
  
};

module.exports = CoinGameContract;