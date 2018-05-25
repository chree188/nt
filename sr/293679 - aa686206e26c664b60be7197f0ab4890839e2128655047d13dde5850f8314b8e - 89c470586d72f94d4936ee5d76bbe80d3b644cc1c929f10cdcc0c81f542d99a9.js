"use strict";

var FlagContractItem = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.content = obj.content;
		this.author = obj.author;
		this.name = obj.name;
		this.date = obj.date;
	}

}

FlagContractItem.prototype = {
	toString: function() {
		JSON.stringify(this);
	}
}

var FlagContract = function(){
	LocalContractStorage.defineMapProperty(this,"data",{
		parse:function(text){
			return new FlagContractItem(text);
		},
		stringify:function(o){
			return o.toString();

		}
	})
}

FlagContract.prototype = {
	init:function(){

	},
	save:function(content,name,date){
		if(!content || !name || !date){
			throw new Error('some arg is empty')
		}
		if(content.length > 400 || name.length > 20){
			throw new Error('content or name exceed limit length')
		}

		var from = Blockchain.transaction.from;
		// throw new Error('name=='+name);
		var flagContractItem = this.data.get(name);
		if(flagContractItem){
			throw new Error('name has been used');
		}

		flagContractItem = new FlagContractItem();
		flagContractItem.author = from;		
		flagContractItem.content = content;
		flagContractItem.name = name;
		flagContractItem.date = date;

		var str_item = JSON.stringify(flagContractItem);
		this.data.set(name,str_item);
	},
	get:function(name){
		if(!name){
			throw new Error('empty name')
		}

		return this.data.get(name);

	}

}

module.exports = FlagContract;