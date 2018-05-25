"use strict";

var GoGame = function (text) {  
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.author = obj.author;
        this.record = obj.record;
        this.time = obj.time;
    }
    else{
        this.name = "";
        this.author = "";
        this.record = "";
        this.time = "";
    }
};

GoGame.prototype = {
    toString: function () {
		return JSON.stringify(this);
	}
};

var GoGameArchive = function () {
    LocalContractStorage.defineMapProperty(this, "archive", {
        parse: function (text) {
            return new GoGame(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

GoGameArchive.prototype = {
    init: function(){

    },

    save: function (name, record) { 

        name = name.trim();
        record = record.trim();
        if (name === "" || record === ""){
            throw new Error("empty name / game record");
        }

        var from = Blockchain.transaction.from;
        var gogame = this.archive.get(name);
        if (gogame){
            throw new Error("Game with the same name exists!");
        }

        gogame = new GoGame();
        gogame.name = name;
        gogame.author = from;
        gogame.record = record;
        var nowDate = new Date();
        var nowDate = new Date();     
        var year = nowDate.getFullYear();    
        var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;    
        var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();    
        gogame.time = year + "-" + month + "-" + day;

        this.archive.put(name, gogame);
     },

     get: function(name){
         name = name.trim();
         if(name == ""){
             throw new Error("Empty game name");
         }
         return this.archive.get(name);
     }
};

module.exports = GoGameArchive;