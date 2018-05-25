"use strict";

var OrderItem = function(text){
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.name = obj.name;
		this.lng = obj.lng;
		this.lat = obj.lat;
		this.address = obj.address;
		this.responded = obj.responded;
	}else{
		this.key =  "";
		this.name =  "";
		this.lng =  "";
		this.lat =  "";
		this.address =  "";
		this.responded = "";
	}
};

OrderItem.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var TaxiCall = function(){
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this,"order",{
		parse: function(text){
			return new OrderItem(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
};

TaxiCall.prototype = {
	init:function(){
		 this.size = 0;
	},
	placeOrder: function(key,name,lng,lat,address){
	
		//name = key.trim();
		//lng = lng.trim();
		//lat	= lat.trim();
		//address = address.trim();
		
		
		if(name ==="" || lng ==="" || lat ==="" || address ==="" ){
			throw new Error("wrong order message");
		}

		key = this.size;
		
		var neworder = new OrderItem();
		neworder.key = key;
		neworder.name = name;
		neworder.lng = lng;
		neworder.lat = lat;
		neworder.address = address;
		neworder.responded = "";
		this.order.put(key,neworder);
		
		this.size = key + 1;
	},
	
	
	takeOrder: function(key){
		//key = key.trim();
		if (key ===""){
			throw new Error("wrong");
		}
		
		var myorder = this.order.get(key);
		
		if(myorder){
			myorder.responded = "take";
			this.order.put(key, myorder);
		}else{
			throw new Error("have no this book");
		}

		
	},
	
	getOrderInfo: function(key){
		//key = key.trim();
		if (key ===""){
			throw new Error("wrong");
		}
		return this.order.get(key);
	},
	
	
	
	getOrder: function () {
		var message = [];
		for(var i=0; i< this.size; i++){
  
			var object = this.order.get(i);
			if(object){
				message.push(object.key + ':'+object.sales);
				return message;
			}
        }

		return message;
    },
	
};
module.exports = TaxiCall;