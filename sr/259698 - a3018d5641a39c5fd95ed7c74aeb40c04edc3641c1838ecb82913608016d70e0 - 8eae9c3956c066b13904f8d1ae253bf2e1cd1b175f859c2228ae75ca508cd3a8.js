"use strict";

var GameRound = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.players = obj.players;
		this.finished = obj.finished;
	} else {
		this.players = [];
		this.finished = false;
	}		
};

GameRound.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Doudizhu = function () {
    LocalContractStorage.defineMapProperty(this, "games", {
        parse: function (text) {
            return new GameRound(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });	
};

Doudizhu.prototype = {
    init: function () {
        // todo
    },

	// 重置单局数据
	clearGameRound:function(gameType)
	{
        var gameRound = this.games.get(gameType);
        if (gameRound){
			gameRound.players = [];
			gameRound.finished = false;
        }
	},
	
	// 加入游戏
    joinGame: function(gameType) 
	{
        gameType = game_type.trim();
		// 参数判断
        if (gameType != "0.0001" || gameType != "0.001" 
			|| gameType != "0.01" || gameType != "0.1" 
			|| gameType != "1"){
            throw new Error("wrong game type");
        }

        var from = Blockchain.transaction.from;
        var gameRound = this.games.get(gameType);
        if (! gameRound){
            gameRound = new GameRound();
        }

		// 如果上一局结束了，重置
		if (gameRound.finished)
			clearGameRound(gameType);
			
		var len = gameRound.players.length();
		if (len < 3)
		{
			gameRound.players.push(from);
			addLog(from.toString() + "join Game(" + gameType + ")");
		}
		else
		{
			// 满三个，开始决定谁是地主
			var rr = Math.floor(Math.random() * len);
			
			// 奖励结果 自己的投入加上地主的一半，扣除千分一的手续费
			var bonusValue = gameType * (1 + 0.5 * 0.999);
			
			// 游戏结束
			// 向长工发放奖励
			var i = 0;
			for (i = 0; i < len; i++)
			{
				if (i != rr)
				{
					sendBonus(gameRound.players[i], bonusValue);
				}
			}
			
			// 平台收取手续费
			sendBonus("n1Rm6JPehhRTtLatuKgYdCd1HiR9Hcvyc7y", gameType * 0.001);
			
			gameRound.finished = true;
		}	
		
        this.games.put(gameType, gameRound);
    },

	// 发放奖励
	sendBonus: function(addr, value)
	{
		if (Blockchain.verifyAddress(addr))
		{
			Blockchain.transfer(addr, value);
			addLog(addr + "gain " + value + " NAS.")
		}
	},
	
	// 添加日志
	addLog: function(str)
	{
		var logs = LocalContractStorage.get("log");
		if (logs == undefined)
			logs = [];
		
		if (logs.length() > 20)
			logs.pop();
		
		logs.push(str);
		LocalContractStorage.set("log", logs);
	},
	
	// 查询日志
    getLog: function() {
        var logs = LocalContractStorage.get("log");
		return logs;
    }
};

module.exports = Doudizhu;