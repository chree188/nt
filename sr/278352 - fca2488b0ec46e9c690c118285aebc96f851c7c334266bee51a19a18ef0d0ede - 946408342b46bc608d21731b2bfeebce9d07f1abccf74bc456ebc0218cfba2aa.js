"use strict";

//var size = 1;

var Man = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.author = obj.author;
		this.time = obj.time;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	    this.time = "";
	}
};

Man.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var AllMan = function () {
    LocalContractStorage.defineProperty(this, "size", null);
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Man(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

AllMan.prototype = {
    init: function () {
        // todo
        this.size = 1;
    },


    set: function (value, time) {
        var index = this.size;
        var from = Blockchain.transaction.from;
        
        var man = this.repo.get(index);
        if (man){
            throw new Error("value has been occupied");
        }
        
        man = new Man();
        man.author = from;
        man.key = index;
        man.value = value;
        man.time = time;
        this.repo.set(index, man);
        this.size++;
        
    },

    foreach: function() {
        var res = "";
        for (var i=0;i<this.size;i++){
            var res_key = i.toString();
            var res_value = this.repo.get(i);
            if(res === ""){
                res += "value:"+res_value
            } else {
                res += "_value:"+res_value;
            }

        }
        return res;
    },

};
module.exports = AllMan;