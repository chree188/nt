'use strict';

// 定义信息类
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.grade = obj.grade; // 分数
		this.author = obj.author; // 作者
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.grade = "";
		this.author = "";
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
};

// 定义合约的原型对象
InfoContract.prototype = {
	// init是星云链智能合约中必须定义的方法，只在布署时执行一次
	init: function() {

	},
	// 提交信息到星云链保存，传入标题和内容
	save: function(author,grade) {

		if(author === "") {
			throw new Error("分数传输错误");
		}
		if(grade === "") {
			throw new Error("分数传输错误");
		}
		var timestamp = Blockchain.transaction.timestamp;
		var info = new Info();
		info.grade = grade;
		info.timestamp = timestamp;
		info.author = author;
		this.infoMap.put(author, info);
		return "success";
		
	},
	// 根据作者的钱包地址从存储区读取内容，返回Info对象
	get: function(author) {
		var lastGrade = this.infoMap.get(author);
		return lastGrade;
	}

};
// 导出代码，标示智能合约入口
module.exports = InfoContract;