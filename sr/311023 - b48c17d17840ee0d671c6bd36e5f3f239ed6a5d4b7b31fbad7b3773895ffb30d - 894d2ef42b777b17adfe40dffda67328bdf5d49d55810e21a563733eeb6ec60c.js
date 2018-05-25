'use strict';
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.playerNickName = obj.playerNickName; // 姓名
		this.playerPhoneNumber = obj.playerPhoneNumber; // 联系方式
		this.playerAddress = obj.playerAddress; // 地址
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.playerNickName = "";
		this.playerPhoneNumber = "";
		this.playerAddress = "";
		this.timestamp = 0;
	}
};

// 将信息类对象转成字符串
Info.prototype.toString = function() {
	return JSON.stringify(this)
};

// 定义智能合约
var InfoContract = function() {
	LocalContractStorage.defineMapProperty(this, "arrayMap");
};

// 定义合约的原型对象
InfoContract.prototype = {
	// init是星云链智能合约中必须定义的方法，只在布署时执行一次
	init: function() {
		this.arrayMap.set("size", 0);
		this.arrayMap.set("keys", []);
	},
	// 提交信息到星云链保存，传入标题和内容
	saveplayerInfo: function(playerNickName, playerPhoneNumber, playerAddress) {
		playerNickName = playerNickName.trim();
		playerPhoneNumber = playerPhoneNumber.trim();
		playerAddress = playerAddress.trim();

		if(playerNickName === "" || playerPhoneNumber === "" || playerAddress == "") {
			throw new Error("个人信息为空！");
		}
		var info = new Info();
		info.playerNickName = playerNickName;
		info.playerPhoneNumber = playerPhoneNumber;
		info.playerAddress = playerAddress;
		info.timestamp = new Date().getTime();
		// 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
		var size = this.arrayMap.get("size") || 0;
		var keys = this.arrayMap.get("keys") || [];
		keys[keys.length] = info.timestamp;
		this.arrayMap.set("keys", keys);
		this.arrayMap.set("size", size + 1);
		this.arrayMap.set(info.timestamp, info);
	},
	get: function(key) {
		return this.arrayMap.get(key);
	},

	keys: function() {
		return this.arrayMap.get("keys") || [];
	},

	size: function() {
		return this.arrayMap.get("size") || 0;
	},

	playerlistall: function() {
		var result = [];
		var keys = this.keys();
		for(var i = 0; i < keys.length; i++) {
			result[i] = this.arrayMap.get(keys[i]);
		}
		return result;
	},
};
// 导出代码，标示智能合约入口
module.exports = InfoContract;