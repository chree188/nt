"use strict";

var LicencePlate = function(text){
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.author = obj.author;
	}else{
		this.key = "";
		this.author = "";
	}
};

LicencePlate.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var DrawLicence = function(){
	LocalContractStorage.defineMapProperty(this,"licenceplate",{
		parse: function(text){
			return new LicencePlate(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
};

DrawLicence.prototype = {
	init:function(){

	},
	savelicence: function(key){

		key = key.trim();
		if(key ===""){
			return "empty  key";
		}

		var from = Blockchain.transaction.from;
		var licenceplate = this.licenceplate.get(key);
		if (licenceplate) {
			return "licenceplate has been occupied";
		}

		licenceplate = new LicencePlate();
		licenceplate.key = key;
		licenceplate.author = from;

		this.licenceplate.put(key,licenceplate);
		return true;
	},
	getlicence: function(key){
		key = key.trim();
		if (key ===""){
			return "empty key";
		}
		return this.licenceplate.get(key);
	}
};
module.exports = DrawLicence;