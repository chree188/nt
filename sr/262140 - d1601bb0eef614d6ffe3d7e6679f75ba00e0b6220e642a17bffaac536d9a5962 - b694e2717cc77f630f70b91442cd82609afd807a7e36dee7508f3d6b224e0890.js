"use strict";

var Dafeiji = function () {
	
};

Dafeiji.prototype = {
    init: function () {
        // todo
    },
	
	// 发放奖励
	sendBonus: function(addr, value)
	{
		if (Blockchain.verifyAddress(addr))
		{
			Blockchain.transfer(addr, value);
		}
	},	
	
	// 继续游戏
    continueGame: function() 
	{
        var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;

		// 平台收费
		this.sendBonus("n1Rm6JPehhRTtLatuKgYdCd1HiR9Hcvyc7y", value);
    },
};

module.exports = Dafeiji;