'use strict';
var History = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.name = obj.name;
		this.score = obj.score;
	} else {
	    this.from = "";
	    this.name = "";
	    this.score = "";

	}
};


var Memory = function () {

};

Memory.prototype = {
	init: function () {
        var arr = [];
        LocalContractStorage.put("table", arr);	
        var from = Blockchain.transaction.from;
        LocalContractStorage.put("admin", from);
        
    },
	push: function (name,score) {
        if (name[name.length-1] != " ") throw new Error("STOP CHEAT BASTARD");
        if (score[score.length-1] != " ") throw new Error("STOP CHEAT BASTARD"); 

        name = name.slice(0, -1);
        score = score.slice(0, -1);
		var arr = LocalContractStorage.get("table");
	    var from = Blockchain.transaction.from;
        var history = new History();
         history.from = from;
         history.name = name;
         history.score = score;
         arr.push(history);
         arr.sort(function compareAge(personA, personB) {
            return  personB.score - personA.score;
          });
        LocalContractStorage.set("table", arr);
        return arr;
    }, 
    
    read: function () {
     var arr = LocalContractStorage.get("table");
     if (!arr || arr.length == 0){
           throw new Error("You dont have any record");
          } 
     return arr;
    },
    delete: function (i) {
        var from = Blockchain.transaction.from;
		var admin = LocalContractStorage.get("admin");
		if(admin !== from) throw new Error("You are not admin");
        var arr = LocalContractStorage.get("table");
        if (!arr || arr.length == 0){
              throw new Error("You dont have any game");
             } 

        arr.splice(i, 1);
        LocalContractStorage.get("table",arr);

        return arr;
       },
    
	
};
module.exports = Memory;
