'use strict';

// 定义信息类
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.title = obj.title; // 姓名
		this.content = obj.content; // 联系方式
		this.address = obj.address; // 地址
		this.source = obj.source; //得分
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.title = "";
		this.content = "";
		this.address = "";
		this.source = 0;
		this.timestamp = 0;
	}
};

// 将信息类对象转成字符串
Info.prototype.toString = function() {
	return JSON.stringify(this)
};

var InfoContract = function() {
	LocalContractStorage.defineMapProperty(this, "infoMap", {
		parse: function(text) {
			return new Info(text);
		},
		stringify: function(o) {
			return o.toString();
		}
	});
	LocalContractStorage.defineMapProperty(this, "data");
};

InfoContract.prototype = {
	init: function() {
		this.data.set("size", 0);
		this.data.set("keys", []);
	},
	save: function(title, content, address, source) {
		title = title.trim();
		content = content.trim();
		address = address.trim();

		if(title === "" || content === "" || address == "") {
			throw new Error("个人信息为空！");
		}


		// 使用内置对象Blockchain获取提交内容的作者钱包地址
		var from = Blockchain.transaction.from;
	
		var info = new Info();
		info.title = title;
		info.content = content;
		info.address = address;
		info.source = source;
		info.timestamp = new Date().getTime();
		info.author = from;

		var size = this.data.get("size") || 0;
		var keys = this.data.get("keys") || [];
		keys[keys.length] = info.timestamp;
		this.data.set("keys", keys);
		this.data.set("size", size + 1);
		this.data.set(info.timestamp, info);
	},
	read: function() {
		var existInfo = this.infoMap.get("formList");
		return existInfo;
	},
	get: function(key) {
		return this.data.get(key);
	},

	keys: function() {
		return this.data.get("keys") || [];
	},

	size: function() {
		return this.data.get("size") || 0;
	},

	listall: function() {
		var result = [];
		var keys = this.keys();
		for(var i = 0; i < keys.length; i++) {
			result[i] = this.data.get(keys[i]);
		}
		return result;
	},

};
module.exports = InfoContract;