'use strict';
var History = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.name = obj.name;
		this.time = obj.time;
	} else {
	    this.from = "";
	    this.name = "";
	    this.time = "";

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
	push: function (name,time) {
        if (name[name.length-1] != " ") throw new Error("STOP CHEAT BASTARD");
        if (time[time.length-1] != "2") throw new Error("STOP CHEAT BASTARD"); 
        if (time[time.length-2] != "4") throw new Error("STOP CHEAT BASTARD");

        name = name.slice(0, -1);
        time = time.slice(0, -1);
        time = time.slice(0, -1);
		var arr = LocalContractStorage.get("table");
	    var from = Blockchain.transaction.from;
        var history = new History();
         history.from = from;
         history.name = name;
         history.time = time;
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
