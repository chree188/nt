"use strict"


var Item = function(text) {
	if(text) {
		
		var obj=JSON.parse(text);
		
		this.name = obj.name;
		this.account = obj.account;
		this.grade = obj.grade;
	}else {
		
		this.name = "";
		this.account = "";
		this.grade = "";
	}
};


Item.prototype ={
	toString :function() {
		return JSON.stringify(this);
	}
};


var Connotations = function (){
	LocalContractStorage.defineMapProperty(this,"cMap",{
		parse: function (text) {
            return new Item(text);
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
	
	save: function(n,g){
		

		
		var from= Blockchain.transaction.from;
		var item = new Item();
		item.grade = g;
		item.name=n;
		item.account=from;
		this.cMap.put(this.length,item);
		this.length=this.length+1;
		
	},
	
	
	
	getItem:function(x){
		return this.cMap.get(x-1);
	},
	getlength: function(){
		return this.length;
	}

};
module.exports = Connotations;

