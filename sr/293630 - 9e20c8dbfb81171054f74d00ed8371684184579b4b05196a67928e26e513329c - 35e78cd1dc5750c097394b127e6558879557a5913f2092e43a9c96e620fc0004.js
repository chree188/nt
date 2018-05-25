"use strict";

var EKUserItem = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.userid = obj.userid;
		this.userlevel = obj.userlevel;
		this.amount = obj.amount;
	} else {
		this.userid = "";
		this.userlevel = "";
		this.amount = "";
	}
};

EKUserItem.prototype = {
	toString: function() {
		return JSON.stringify(this);
	}
};

var EKUserSystem = function() {
	LocalContractStorage.defineMapProperty(this, "EKUser", {
		parse: function(text) {
			return new EKUserItem(text);
		},
		stringify: function(o) {
			return o.toString();
		}
	});
};

EKUserSystem.prototype = {
	init: function() {
		// todo
	},

	login: function() {},

	getUserInfo: function(userid) {
		userid = userid.trim();
		if(userid.length < 20) {
			throw new Error("登录错误!")
		}
		var userItem = this.EKUser.get(userid);
		if(userItem) {

		} else {
			userItem = new EKUserItem();
			userItem.userid = userid;
			userItem.userlevel = 0;
			userItem.amount = 0;

			this.EKUser.put(userid, userItem);
		}
		return userItem;
	},

	save: function(userid, userlevel, amount) {

		userid = userid.trim();
		userlevel = userlevel.trim();
		userlevel = parseInt(userlevel);
		amount = amount.trim();

		if(userid === "" || userlevel === "" || amount === "") {
			throw new Error("请正确登录!");
		}

		var userItem = this.EKUser.get(userid);
		if(userItem) {

		} else {
			userItem = new EKUserItem();
		}

		userItem.userid = userid;
		userItem.userlevel = userlevel;
		userItem.amount = amount;

		this.EKUser.put(userid, userItem);
	},
	uplevel:function(){
		var userid = Blockchain.transaction.from;
		
		var userItem = this.EKUser.get(userid);
		if(userItem) {

		} else {
			userItem = new EKUserItem();
			userItem.amount = new BigNumber(0);
		}

		userItem.userid = userid;
		userItem.userlevel = 0;
		var current = new BigNumber(userItem.amount);
		userItem.amount = current.plus(new BigNumber(Blockchain.transaction.value));
	
		this.EKUser.put(userid, userItem);
		
	},
	get: function(userid) {
		userid = userid.trim();
		if(userid === "") {
			throw new Error("请正确登录!")
		}
		return this.EKUser.get(userid);
	},

	takeout: function(value) {
		var amount = new BigNumber(value);
		var result = Blockchain.transfer("n1FLYbCM4A1DqcQihjVfrFwoxY9f5CV6jFi", amount);
		if(!result) {
			throw new Error("取现失败!" + value + " " + result + " " + amount);
		} else {
			return "取现dn" + value + " " + result + " " + amount;
		}
	},

	takeout2: function(value) {
		var amount = new BigNumber(value);
		var result = Blockchain.transfer("n1FLYbCM4A1DqcQihjVfrFwoxY9f5CV6jFi", value);
		if(!result) {
			throw new Error("取现失败!" + value + " " + result + " " + amount);
		}

		Event.Trigger("EKUser", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: "n1FLYbCM4A1DqcQihjVfrFwoxY9f5CV6jFi",
				value: amount.toString()
			}
		});

	}
};

module.exports = EKUserSystem;