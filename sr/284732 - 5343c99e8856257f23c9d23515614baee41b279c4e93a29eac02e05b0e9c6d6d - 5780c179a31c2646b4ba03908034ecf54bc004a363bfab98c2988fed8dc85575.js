"use strict";

var PeopleContent = function (text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
	} else {
		this.key = "";
	}
	this.game = new Array(1,1,1,1,1,1,1);
};

PeopleContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var MemberContract = function () {
	LocalContractStorage.defineProperty(this, "promulgator");
	LocalContractStorage.defineProperty(this, "bonus");
	LocalContractStorage.defineMapProperty(this, "member", {
		parse: function (text) {
            return new PeopleContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   
};

MemberContract.prototype = {
    init: function () {
		this.promulgator=Blockchain.transaction.from;
		var memberItem = new PeopleContent();
		memberItem.key = this.promulgator;
		this.member.put(this.promulgator,memberItem);
		this.bonus = 100;
    },

	getgame: function(key){
		var memberItem = this.member.get(this.promulgator);
		if (memberItem) {
			return memberItem.game[key];
		}
		return 0;
    },
	
    exchangebonus: function (key) {
        var account = this.promulgator;
		var memberItem = this.member.get(account);
		if (memberItem) {
			if(memberItem.game[key] > 0){
				memberItem.game[key] = 0;
				this.bonus += 100;
				this.member.put(this.promulgator,memberItem);
			}else{
				throw new Error("该场次不能兑换 " + memberItem.game[key]);
			}
		}else{
			throw new Error("请先注册");
		}
    },


    getbonus: function(){
		return this.bonus;
    },

 
	exchangegift: function (key) {
		var account = Blockchain.transaction.from;
		var memberItem = this.member.get(account);

		if(this.bonus >= key){
			this.bonus =  this.bonus - key;
			return this.bonus
		}
		throw new Error("余额不足兑换失败");
    },

};

module.exports = MemberContract;