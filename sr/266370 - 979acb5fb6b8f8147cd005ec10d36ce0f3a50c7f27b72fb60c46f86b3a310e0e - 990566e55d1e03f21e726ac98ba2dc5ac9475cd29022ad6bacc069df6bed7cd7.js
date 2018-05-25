"use strict";

/**
 *	封神榜=[蛇榜,...,...,...,...]
 **/
var Game = function (value)
{
	if(value)
	{
		var obj = JSON.parse(value);
		this.index = obj.index;
		this.userName = obj.userName;
		this.time = obj.time;
		this.score = obj.score;
	}
	else
	{
		this.index = 0;
		this.userName = "";
		this.time = 0;
		this.score = 0;
	}
};


Game.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var FSBContract = function () {
	LocalContractStorage.defineMapProperty(this, "userDataMap", null);
	LocalContractStorage.defineMapProperty(this, "fsbDataMap", {
		stringify: function (obj) {
			return obj.toString();
		},
		parse: function (obj) {
			return new Game(obj);
		}
	});
	LocalContractStorage.defineProperty(this, "size", null);
};

FSBContract.prototype = {
	size:0,
	init: function () 
	{
		this.size = 0;
	},
	// 将每次游戏结果上传
	save: function (score, timestamp) 
	{
		if(score === -1)
		{
			throw new Error("请先完成一次游戏");	
		}
		else
		{
			var from = Blockchain.transaction.from;

			timestamp = timestamp ? timestamp : 1525662752;

			var index = this.size;

			var game = new Game();
			game.index = index;
			game.time = timestamp;
			game.userName = from;
			game.score = score;

			this.fsbDataMap.put(index, game);

			var userHistoryResults = this.userDataMap.get(from) || [];
			userHistoryResults[userHistoryResults.length] = index;
			this.userDataMap.set(from, userHistoryResults);

			this.size += 1;	
		}
	},
	findFSB: function () 
	{
		var list = [];
		for(var i = 0; i < this.size; i++) 
		{
			list[i] = this.fsbDataMap.get(i);
		}
		return list;
	},
	findByUserName: function (from) 
	{
		var indexArr = this.userDataMap.get(from) || [];
		var valueArr = [];
		for(var i = 0; i < indexArr.length; i++) 
		{
			value[i] = this.fsbDataMap.get(indexArr[i]);
		}
		return valueArr;
	},
};

module.exports = FSBContract; 