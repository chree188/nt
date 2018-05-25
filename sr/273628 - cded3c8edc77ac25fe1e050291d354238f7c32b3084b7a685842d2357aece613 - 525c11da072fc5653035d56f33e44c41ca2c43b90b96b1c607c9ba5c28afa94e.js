"use strict"


var JokerItem = function(text) {
	if(text) {
		// 解析json
		var obj=JSON.parse(text);
		
		this.content = obj.content;
		this.account = obj.account;
	}else {
		
		this.content = "";
		this.account = "";
	}
};


JokerItem.prototype ={
	toString :function() {
		return JSON.stringify(this);
	}
};


var Connotations = function (){
	LocalContractStorage.defineMapProperty(this,"JokerMap",{
		parse: function (text) {
            return new JokerItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
        
    });
    LocalContractStorage.defineProperty(this, "length",null);
}


Connotations.prototype ={
	init: function(){
		
		this.length=0;
	},
	
	save: function(value){
		

		
		var from= Blockchain.transaction.from;
		var jokerItem = new JokerItem();
		
		jokerItem.content=value;
		jokerItem.account=from;
		this.JokerMap.put(this.length,jokerItem);
		this.length=this.length+1;
		
	},
	
	
	
	getJoker:function(x){
		return this.JokerMap.get(x-1);
	},
	getlength: function(){
		return this.length;
	}

};
module.exports = Connotations;

