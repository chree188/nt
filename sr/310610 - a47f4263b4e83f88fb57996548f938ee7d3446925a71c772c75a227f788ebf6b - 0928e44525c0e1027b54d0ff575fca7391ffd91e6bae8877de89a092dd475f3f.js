'use strict';

// 定义信息类
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.nickName = obj.nickName; // 姓名
		this.phoneNum = obj.phoneNum; // 联系方式
		this.address = obj.address; // 地址
		this.source = obj.source; //得分
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.nickName = "";
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
	save: function(nickName, phoneNum, address, source) {
		nickName = nickName.trim();
		phoneNum = phoneNum.trim();
		address = address.trim();

		if(nickName === "" || phoneNum === "" || address == "") {
			throw new Error("个人信息为空！");
		}

		//      if (nickName.length > 64) {
		//          throw new Error("标题长度超过64个字符！");
		//      }
		//
		//      if (phoneNum.length > 256) {
		//          throw new Error("内容长度超过256个字符！");
		//      }
		// 使用内置对象Blockchain获取提交内容的作者钱包地址
		var from = Blockchain.transaction.from;
		// 此处调用前面定义的反序列方法parse，从存储区中读取内容
		//      var existInfo = this.infoMap.get(from);
		//      if (existInfo) {
		//          throw new Error("您已经发布过内容！");
		//      }
		var info = new Info();
		info.nickName = nickName;
		info.phoneNum = phoneNum;
		info.address = address;
		info.source = source;
		info.timestamp = new Date().getTime();
		info.author = from;
		// 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
		var size = this.arrayMap.get("size") || 0;
		var keys = this.arrayMap.get("keys") || [];
		keys[keys.length] = info.timestamp;
		this.arrayMap.set("keys", keys);
		this.arrayMap.set("size", size + 1);
		this.arrayMap.set(info.timestamp, info);
	},
	// 根据作者的钱包地址从存储区读取内容，返回Info对象
	read: function() {
		var existInfo = this.infoMap.get("formList");
		return existInfo;
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
	// 验证地址是否合法
	verifyAddress: function(address) {
		// 1-valid, 0-invalid
		var result = Blockchain.verifyAddress(address);
		return {
			valid: result == 0 ? false : true
		};
	}
};
// 导出代码，标示智能合约入口
module.exports = InfoContract;