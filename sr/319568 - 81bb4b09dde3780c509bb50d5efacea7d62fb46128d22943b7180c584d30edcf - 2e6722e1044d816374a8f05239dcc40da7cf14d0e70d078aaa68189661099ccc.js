"use strict";

var PlaneBattle = function(){
	//用来保存用户地址与分数
	LocalContractStorage.defineMapProperty(this, "dataMap");
	//用来保存size与地址
	LocalContractStorage.defineMapProperty(this, "iteratorMap");
	//用来保存size
	LocalContractStorage.defineProperty(this, "size");
};

PlaneBattle.prototype = {
	
init: function(){
	//初始化size
	this.size = 0;
},

save: function(score){
	//获取钱包地址
	var from = Blockchain.transaction.from;
	//查看此地址是否已经有分数
	var existingObj = this.dataMap.get(from);
	var existingScore = null;
	//如果此地址已经有分数记录
	if(existingObj != null){
		existingScore = JSON.parse(existingObj).score;
	}
	
	
	var firstTime = false;
	var higherScore = false;
	
	if(existingScore == null){
		//第一次保存分数
		firstTime = true;
	}else{
		//分数再创新高
		if(existingScore < score){
			higherScore = true;
		}		
	}
	
	if(firstTime){//第一次保存分数，需要在dataMap以及iteratorMap中都保存，并且size加1
		var obj = new Object();
		obj.address = from;
		obj.score = score;
		this.dataMap.set(from, JSON.stringify(obj));	
		this.iteratorMap.set(this.size, from);	
		this.size += 1;
	}
	
	if(higherScore){//如果是分数再创新高的情况，只更新dataMap中的记录
		var obj = new Object();
		obj.address = from;
		obj.score = score;
		this.dataMap.set(from, JSON.stringify(obj));	
	}
	
},


getAll: function(){
		var result = [];
        for(var i=0;i<this.size;i++){
			//现根据i取出地址，然后再根据地址取出分数
            result.push(this.dataMap.get(this.iteratorMap.get(i)));
        }
        return result;
    }

};

module.exports = PlaneBattle;
