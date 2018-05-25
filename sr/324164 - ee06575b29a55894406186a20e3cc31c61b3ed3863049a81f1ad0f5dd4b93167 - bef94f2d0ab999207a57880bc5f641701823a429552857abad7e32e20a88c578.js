'use strict';

// 定义信息类
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.nickName = obj.nickName; // 姓名
		this.content = obj.content; // 联系方式
		this.address = obj.address; // 地址
		this.timestamp = obj.timestamp; // 时间戳
		this.author = obj.author;
	} else {
		this.nickName = "";
		this.content = "";
		this.address = "";
		this.timestamp = 0;
		this.author = "";
	}
};

// 将信息类对象转成字符串
Info.prototype.toString = function() {
	return JSON.stringify(this)
};

// 定义信息类
var User = function(text) {
	if(text) {
		this.timestamp = obj.timestamp; // 时间戳
		this.author = obj.author;
		this.nickName = obj.nickName;
		this.jj = obj.jj;
		this.DApp = obj.DApp;
	} else {
		this.timestamp = 0;
		this.author = "";
		this.nickName = "星云友人";
		this.DApp = "";
		this.jj = "这个家伙很懒什么都没有留下。。。";
	}
};

// 将信息类对象转成字符串
User.prototype.toString = function() {
	return JSON.stringify(this)
};

// 定义智能合约
var InfoContract = function() {
	// 使用内置的LocalContractStorage绑定一个map，名称为infoMap
	// 这里不使用prototype是保证每布署一次该合约此处的infoMap都是独立的

	LocalContractStorage.defineMapProperty(this, "userMap");
};

// 定义合约的原型对象
InfoContract.prototype = {
	// init是星云链智能合约中必须定义的方法，只在布署时执行一次
	init: function() {
		this.userMap.set("size", 0);
		this.userMap.set("keys", []);
	},

	logIn: function(nc, jj, DApp) {

		nc = nc.trim();
		jj = jj.trim();
		DApp = DApp.trim();

		// 使用内置对象Blockchain获取提交内容的作者钱包地址
		var from = Blockchain.transaction.from;
		// 此处调用前面定义的反序列方法parse，从存储区中读取内容

		var user = new User();
		user.timestamp = new Date().getTime();
		user.author = from;
		user.nickName = nc;
		user.DApp = DApp;
		user.jj = jj;

		// 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
		var size = this.userMap.get("size") || 0;
		var keys = this.userMap.get("keys") || [];
		keys[keys.length] = user.timestamp;
		this.userMap.set("keys", keys);
		this.userMap.set("size", size + 1);
		this.userMap.set(user.timestamp, user);

	},
	// 提交信息到星云链保存，传入标题和内容
	saveMineInfo: function(nc, jj, DApp) {
		nc = nc.trim();
		jj = jj.trim();
		DApp = DApp.trim();

		// 使用内置对象Blockchain获取提交内容的作者钱包地址
		var from = Blockchain.transaction.from;
		// 此处调用前面定义的反序列方法parse，从存储区中读取内容

		var userList = this.userList();
		var Mkey = userList[0].timestamp;
		var user = new User();
		user.timestamp = Mkey;
		user.author = from;
		user.nickName = nc;
		user.DApp = DApp;
		user.jj = jj;

		var size = this.userMap.get("size") || 0;
		var keys = this.userMap.get("keys") || [];

		// 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区

		this.userMap.set("keys", keys);
		this.userMap.set("size", size);
		this.userMap.set(Mkey, user);
	},
	getMkey: function() {
		var userList = this.userList();
		var Mkey = userList[0].timestamp;
		return Mkey;
	},

	friendsget: function(key) {
		return this.userMap.get(key);
	},

	friendskeys: function() {
		return this.userMap.get("keys") || [];
	},

	friendssize: function() {
		return this.userMap.get("size") || 0;
	},

	friendsList: function() {
		var index = 0;
		var result = [];
		var keys = this.friendskeys();
		var from = Blockchain.transaction.from;
		for(var i = 0; i < keys.length; i++) {
			if(this.userMap.get(keys[i]).author == from) {

			} else {
				result[index] = this.userMap.get(keys[i]);
				index++;
			}
		}
		return result;
	},

	userget: function(key) {
		return this.userMap.get(key);
	},

	userkeys: function() {
		return this.userMap.get("keys") || [];
	},

	usersize: function() {
		return this.userMap.get("size") || 0;
	},

	userList: function() {
		var result = [];
		var keys = this.userkeys();
		var from = Blockchain.transaction.from;
		for(var i = 0; i < keys.length; i++) {
			if(this.userMap.get(keys[i]).author == from) {
				result[0] = this.userMap.get(keys[i]);
			}
		}
		return result;
	},

	userCheck: function() {
		var userList = this.userList();
		return userList;
	},

	getDapp: function(Dfrom) {
		var r = [];
		var userList = this.friendsList();
		for(var i = 0; i < userList.length; i++) {
			if(userList[i].author == Dfrom) {
				r = userList[i];
			}
		}

		return r;
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