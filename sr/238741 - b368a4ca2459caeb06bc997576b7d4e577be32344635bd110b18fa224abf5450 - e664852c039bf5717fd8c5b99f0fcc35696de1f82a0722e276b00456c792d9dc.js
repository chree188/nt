"use strict";

var DataStucture = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	}
};

DataStucture.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BTWorld = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DataStucture(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BTWorld.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 1024 || key.length > 218){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dataStucture = this.repo.get(key);
        if (dataStucture){
            var result =[];
            result[0]=dataStucture.value;
           result.push("\r\n"+value);
           dataStucture.value =result ;
          this.repo.put(key, dataStucture);
        }else{
        	
        dataStucture = new DataStucture();
        dataStucture.author = from;
        dataStucture.key = key;
        dataStucture.value = value;

        this.repo.put(key, dataStucture);	
        }

        
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = BTWorld;