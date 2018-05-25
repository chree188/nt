"use strict";

var OrderItem = function(text){
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.name = obj.name;
		this.lng = obj.lng;
		this.lat = obj.lat;
		this.address = obj.address;
		this.tel = obj.tel;
		this.responded = obj.responded;
	}else{
		this.key =  "";
		this.name =  "";
		this.lng =  "";
		this.lat =  "";
		this.address =  "";
		this.tel = "";
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
	placeOrder: function(key,name,tel,lng,lat,address){
	
		name = name.trim();
		lng = lng.trim();
		lat	= lat.trim();
		tel = tel.trim();
		address = address.trim();
		
		
		if(name ==="" || lng ==="" || lat ==="" ){
			throw new Error("wrong order message");
		}

		var index = this.size;
		
		var neworder = new OrderItem();
		neworder.key = index;
		neworder.name = name;
		neworder.lng = lng;
		neworder.lat = lat;
		neworder.address = address;
		neworder.responded = "";
		this.order.put(index,neworder);
		
		this.size = index + 1;
	},
	
	
	takeOrder: function(key){
		key = key.trim();
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
				if(object.responded ===""){
					message.push(object);
				}else{
					
				}
			}
        }

		return message;
    },
	
};
module.exports = TaxiCall;