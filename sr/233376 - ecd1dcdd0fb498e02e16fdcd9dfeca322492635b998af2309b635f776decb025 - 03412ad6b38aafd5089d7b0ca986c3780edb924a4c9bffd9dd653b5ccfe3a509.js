"use strict";

var SameBirthDate = function(){
	LocalContractStorage.defineMapProperty(this, "dataMap");
};

SameBirthDate.prototype = {
	init: function(){
	},
	save: function(birthDate, email){
		birthDate = birthDate.trim();
		email = email.trim();
		if (birthDate === "" || email === ""){
            throw new Error("empty birth date / email");
        }
		
		var myArr = [];
		var tempObj = this.dataMap.get(birthDate);
		if(tempObj != null){
			myArr = JSON.parse(tempObj);			
		}
		
		
		
		var obj = new Object();
		//obj.birthDate = birthDate;
		obj.email = email;
		obj.author = Blockchain.transaction.from;
		
		myArr.push(obj);
		
		this.dataMap.set(birthDate, JSON.stringify(myArr));
		
	},
	get: function(birthDate){
		birthDate = birthDate.trim();
		if (birthDate === ""){
            throw new Error("empty birth date");
        }
		var myArr = [];
		var tempObj = this.dataMap.get(birthDate);
		if(tempObj != null){
			myArr = JSON.parse(tempObj);			
		}
		return myArr;
	}
	
};

module.exports = SameBirthDate;