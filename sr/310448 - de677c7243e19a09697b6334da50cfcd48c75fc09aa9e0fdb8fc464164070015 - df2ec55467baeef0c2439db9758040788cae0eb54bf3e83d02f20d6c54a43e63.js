'use strict';
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.username = obj.username; // 姓名
		this.phoneNum = obj.phoneNum; // 联系方式
		this.address = obj.address; // 地址
		this.source = obj.source; //得分
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.username = "";
		this.phoneNum = "";
		this.address = "";
		this.source = 0;
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
	init: function() {
		this.arrayMap.set("size", 0);
		this.arrayMap.set("keys", []);
	},
	save: function(username, phoneNum, address, source) {
		username = username.trim();
		phoneNum = phoneNum.trim();
		address = address.trim();

		if(username === "" || phoneNum === "" || address == "") {
			throw new Error("个人信息为空！");
		}
		var info = new Info();
		info.username = username;
		info.phoneNum = phoneNum;
		info.address = address;
		info.source = source;
		info.timestamp = new Date().getTime();
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

	listall: function() {
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