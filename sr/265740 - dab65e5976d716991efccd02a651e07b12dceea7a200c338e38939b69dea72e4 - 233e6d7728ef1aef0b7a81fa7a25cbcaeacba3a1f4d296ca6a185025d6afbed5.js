'use strict';

// 定义吐槽类
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.title = obj.title; // 标题
		this.content = obj.content; // 内容
		this.author = obj.author; // 作者
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.title = "";
		this.content = "";
		this.author = "";
		this.timestamp = 0;
	}
};

// 将吐槽类对象转成字符串
Info.prototype.toString = function() {
	return JSON.stringify(this)
};

// 定义智能合约
var SpitslotContact = function() {
	//遍历循环的时候需要用到的Map
	LocalContractStorage.defineMapProperty(this, "arrayMap");
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
	LocalContractStorage.defineProperty(this, "size");
};

// 定义合约的原型对象
SpitslotContact.prototype = {
	// init是星云链智能合约中必须定义的方法，只在布署时执行一次
	init: function() {
		this.size = 0;
	},
	get: function(key) {
		return this.infoMap.get(key);
	},
	// 提交信息到星云链保存，传入标题和内容
	save: function(title, content) {
		var index = this.size;
		
		title = title.trim();
		content = content.trim();

		if(title === "" || content === "") {
			throw new Error("标题或内容为空！");
		}

		if(title.length > 64) {
			throw new Error("标题长度超过64个字符！");
		}

		if(content.length > 1000) {
			throw new Error("内容长度超过1000个字符！");
		}
		// 使用内置对象Blockchain获取提交内容的作者钱包地址
		var from = Blockchain.transaction.from;

		var info = new Info();
		info.title = title;
		info.content = content;
		info.timestamp = new Date().getTime();
		info.author = from;

		//将Info对象存储到存储区
		this.arrayMap.set(index, info.timestamp);
		this.infoMap.put(info.timestamp, info);
		this.size += 1;
		
	},
	// 返回Info对象
	read: function(limit, offset) {
		limit = parseInt(limit);
		offset = parseInt(offset);
		if(offset > this.size) {
			throw new Error("offset is not valid");
		}
		var number = offset + limit;
		if(number > this.size) {
			number = this.size;
		}
		var result = "";
		for(var i = offset; i < number; i++) {
			var key = this.arrayMap.get(i);
			result += this.infoMap.get(key) + "_";
		}
		if(result != ""){
			result = result.substr(0,result.length-1);
		}
		return result;
	}
};
// 导出代码，标示智能合约入口
module.exports = SpitslotContact;