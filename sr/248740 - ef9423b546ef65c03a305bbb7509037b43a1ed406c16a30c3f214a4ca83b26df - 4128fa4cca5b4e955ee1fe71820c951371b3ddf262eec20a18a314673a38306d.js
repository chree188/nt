"use strict";

var BookingItem = function(text){
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.content = obj.content;
		this.author = obj.author;
	}else{
		this.key ;
		this.content = "";
		this.author = "";
	}
};

BookingItem.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var Bookingticket = function(){
	LocalContractStorage.defineMapProperty(this,"repo",{
		parse: function(text){
			return new BookingItem(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
	
};

Bookingticket.prototype = {
	init:function(){

		//todo
	},
	save: function(key,content){

		key = key.trim();
		content = content.trim();
		if(key ===""){
			throw new Error("not select!!");
		}
		if(content.length > 500 ){
			throw new Error("query too long");
		}
		
		var from = Blockchain.transaction.from;
		
		for(var row = 0;row < 10; row++){
			for(var col = 0;col < 10; col++){
				var tmpkey =  row + '_' + col;
				
				var ret = key.indexOf(tmpkey);

				if( ret >= 0){
					var bookingItem = this.repo.get(tmpkey);
					if (bookingItem) {
						if(bookingItem.author.length > 0){
							//somebody book already
						}else{
							bookingItem.content = content;
							bookingItem.author = from;
							this.repo.put(tmpkey, bookingItem);
						}
					}else{
						bookingItem = new BookingItem();
						bookingItem.key = tmpkey;
						bookingItem.author = from;
						bookingItem.content = content;
						this.repo.put(tmpkey, bookingItem);
					}
					
				}
			}
		}

	},
	get: function(key){
		key = key.trim();
		if (key ===""){
			throw new Error("not select yet");
		}
		return this.repo.get(key);
	},
	polling: function(){
		var arr = [];
		arr += "nas";
		for(var row = 0;row < 10; row++){
			for(var col = 0;col < 10; col++){
				var tmpkey =  row + '_' + col;
				var bookingItem = this.repo.get(tmpkey);
				if (bookingItem) {
					if(bookingItem.author.length > 0){
						arr = arr + '-' + tmpkey;
					}
				}
			}
		}
		
		return arr;
	}
};
module.exports = Bookingticket;