"use strict";
var CharityShare = function () {
    LocalContractStorage.defineMapProperty(this, "names");
    LocalContractStorage.defineMapProperty(this, "addrs");
};


CharityShare.prototype = {
	init: function () {
		//leave
	},
	 send: function(name, value){
	 	 
	 	         var fundsName = this.names.get(name);
	 	         if (fundsName){
	 	         	console.log('not reserved name')
	 	         };

        this._validateData(name);

        var wallet = this.addrs.get(name);

        var result = Blockchain.transfer(wallet, value);
        conslole.log("transfer result:", result);
        
       

	 },
	 send2: function(address, value) {
	 	return Blockchain.transfer(address, value);
	 },

 	_validateData: function(name) {

 		if (name === ""){
            throw new Error("empty field / value");
        }

       
        if(name.length > 64) {
    		throw new Error("Invalid name length. max 64 characters");
    	}

    	if(!/^[a-zA-Z0-9_\-.]+$/.test(name)) {
    		throw new Error("Invalid data. allowed characters: A-Z, 0-9, _, -, .");
    	}

    	return true;
    },

	save: function (name) {
 		
    	name = name.trim();
       
        this._validateData(name);
		var from = Blockchain.transaction.from;
    	
    	if(this.addrs.get(name) && this.addrs.get(name) !== from) {
    		throw new Error("Name is already reserved");
    	}
    	
    	this.names.set(from, name);
    	this.addrs.set(name, from);

      return true;

    },
    check: function (name) {
    	return this.addrs.get(name);
    	    }
    


		};
		

module.exports = CharityShare;

















