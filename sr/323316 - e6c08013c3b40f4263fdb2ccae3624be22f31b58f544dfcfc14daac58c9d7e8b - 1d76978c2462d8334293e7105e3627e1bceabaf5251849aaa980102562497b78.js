"use strict";

//
var NasfishContract = function () {
    LocalContractStorage.defineMapProperty(this, "accounts");
    LocalContractStorage.defineMapProperty(this, "orders");
	LocalContractStorage.defineProperties(this, {
		odnum : 100000,
		wei : 1000000000000000000,
		fee : new BigNumber(0.01)
	});
};
NasfishContract.prototype = {
	init:function(){
		this.odnum = 100000;
		this.wei = 1000000000000000000;
		this.fee = new BigNumber(0.01);
	},
	bind : function(){
		var from = Blockchain.transaction.from;
		var time  = Blockchain.transaction.timestamp.toString(10);
    	this.accounts.set(from, time);
    	return from;
	},
	
	makebid: function(fishcoin,amount){
		//
		if(parseInt(fishcoin)<200){
			throw new Error("Minimum fishcoin = 200");
		}
		this.odnum++;
		var odid = Blockchain.transaction.from+'_'+this.odnum;
		var od = {
			odid  : odid,
			maker : Blockchain.transaction.from,
			fishcoin : parseInt(fishcoin),
			amount : amount,
			time : Blockchain.transaction.timestamp.toString(10),
		};
		//
    	this.orders.set(odid, od);
    	return od;
	},
	
	sellcoin: function(odid){
		var od = this.orders.get(odid);
    	if(!od) {
    		throw new Error("Empty "+odid);
    	}
    	//
		if(Blockchain.verifyAddress(od.maker)){
			var amount = new BigNumber(od.amount);//
			amount = amount.mul(this.wei);
			var from = Blockchain.transaction.from;
			var result = Blockchain.transfer(from, amount);
			if(result){
				this.orders.del(odid);
				return odid;
			}else{
				throw new Error("Take transfer error.");
			}
		}else{
			throw new Error("Address invalid!");
		}
    	
	}
	
};

module.exports = NasfishContract;