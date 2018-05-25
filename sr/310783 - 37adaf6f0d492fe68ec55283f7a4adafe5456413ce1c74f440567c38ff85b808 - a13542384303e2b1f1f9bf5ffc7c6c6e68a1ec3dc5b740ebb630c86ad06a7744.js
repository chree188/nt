'use strict';
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.player = obj.player; // 姓名
		this.pNum = obj.pNum; // 联系方式
		this.address = obj.address; // 地址
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.player = "";
		this.pNum = "";
		this.address = "";
		this.timestamp = 0;
	}
};

// 将信息类对象转成字符串
Info.prototype.toString = function() {
	return JSON.stringify(this)
};

// 定义智能合约
var InfoContract = function() {
	// 使用内置的LocalContractStorage绑定一个map，名称为infoMap
	// 这里不使用prototype是保证每布署一次该合约此处的infoMap都是独立的
	LocalContractStorage.defineMapProperty(this, "infoMap", {
		// 从infoMap中读取，反序列化
		parse: function(text) {
			return new Info(text);
		},
		// 存入infoMap，序列化
		stringify: function(o) {
			return o.toString();
		}
	});
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
	save: function(player, pNum, address) {
		player = player.trim();
		pNum = pNum.trim();
		address = address.trim();

		if(player === "" || pNum === "" || address == "") {
			throw new Error("个人信息为空！");
		}
		var info = new Info();
		info.player = player;
		info.pNum = pNum;
		info.address = address;
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

	listall: function() {
		var result = [];
		var keys = this.keys();
		for(var i = 0; i < keys.length; i++) {
			result[i] = this.arrayMap.get(keys[i]);
		}
		return result;
	}
};
// 导出代码，标示智能合约入口
module.exports = InfoContract;