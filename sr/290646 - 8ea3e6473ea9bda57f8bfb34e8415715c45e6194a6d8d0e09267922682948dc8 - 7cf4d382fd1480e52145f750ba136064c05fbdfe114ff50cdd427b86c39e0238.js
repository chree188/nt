'use strict';
var History = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.score = obj.score;
		this.name = obj.name;
		this.time = obj.time;
	} else {
	    this.from = "";
	    this.score = "";
	    this.name = "";
	    this.time = "";

	}
};


var BankVaultContract = function () {

};

BankVaultContract.prototype = {
	init: function () {
        var arr = [];
		LocalContractStorage.put("table", arr);	
    },
	push: function (name,score,time) {
        if (name[name.length-1] != " ") throw new Error("STOP CHEAT BASTARD");
        if (time[time.length-1] != "2") throw new Error("STOP CHEAT BASTARD"); 
        if (time[time.length-2] != "4") throw new Error("STOP CHEAT BASTARD");

        name.substring(0, name.length - 1)
		var arr = LocalContractStorage.get("table");
	    var from = Blockchain.transaction.from;
        var history = new History();
         history.from = from;
         history.name = name;
         history.time = time;
         history.score =score;
         arr.push(history);
         arr.sort(function compareAge(personA, personB) {
            return personA.time - personB.time;
          });
        LocalContractStorage.set("table", arr);
        return arr;
    }, 
    
    read: function () {
     var arr = LocalContractStorage.get("table");
     if (!arr || arr.length == 0){
           throw new Error("You dont have any game");
          } 
     return arr;
    }
	
};
module.exports = BankVaultContract;
