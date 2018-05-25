"use strict";

var BirthdayItem = function(text){
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.content = obj.content;
		this.author = obj.author;
	}else{
		this.key = "";
		this.content = "";
		this.author = "";
	}
};

BirthdayItem.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var BirthdaySay = function(){
	LocalContractStorage.defineMapProperty(this,"repo",{
		parse: function(text){
			return new BirthdayItem(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
};

BirthdaySay.prototype = {
	init:function(){

	},
	save: function(key,content){

		key = key.trim();
		content = content.trim();
		if(key ==="" || content ==="" ){
			throw new Error("empty birthday/ message");
		}
		if(content.length > 200 ){
			throw new Error("message exceed 200 length");
		}

		var from = Blockchain.transaction.from;
		var birthdayItem = this.repo.get(key);
		if (birthdayItem) {
			throw new Error("birthday has been occupied");
		}

		birthdayItem = new BirthdayItem();
		birthdayItem.key = key;
		birthdayItem.content = content;
		birthdayItem.author = from;

		this.repo.put(key,birthdayItem);

	},
	get: function(key){
		key = key.trim();
		if (key ===""){
			throw new Error("empty birthday");
		}
		return this.repo.get(key);
	}
};
module.exports = BirthdaySay;