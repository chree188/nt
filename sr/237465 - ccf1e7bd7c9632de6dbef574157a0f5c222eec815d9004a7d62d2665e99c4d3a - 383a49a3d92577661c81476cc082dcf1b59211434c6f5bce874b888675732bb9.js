"use strict";

var PropItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
		this.prophesy = obj.prophesy;
        this.author = obj.author;
        this.timestamp = obj.timestamp;
        this.person = obj.person;
	} else {
	    this.author = "";
        this.prophesy = "";
        this.timestamp = "";
        this.person = "";
	}
};

PropItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Prophesy = function () {
    LocalContractStorage.defineMapProperty(this, "propsMap", {
        parse: function (text) {
            return new PropItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "propsMapSize");
};

Prophesy.prototype = {
    init: function () {
        this.propsMapSize = 0;
    },

    save: function (prophesy,person) {

        prophesy = prophesy.trim();
        if (prophesy === ""){
            return "empty";
            throw new Error("empty prophesy");
        }

        if (prophesy.length > 100){
            return "limit";
            throw new Error("prophesy exceed limit length");
        }

        if(person){
            if (person.length > 5){
                return "limit";
                throw new Error("person exceed limit length");
            }
        }
        var index = this.propsMapSize;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var propItem = new PropItem();
        propItem.author = from;
        propItem.prophesy = prophesy;
        propItem.person = person;
        propItem.timestamp = timestamp;
        
        this.propsMap.put(index,propItem);
        this.propsMapSize +=1;
        return "success";
    },

    len:function(){
        return this.propsMapSize;
    },

    iterate: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.propsMapSize){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.propsMapSize){
          number = this.propsMapSize;
        }
        var result = new Array();
        for(var i=offset;i<number;i++){
            var prop = this.propsMap.get(i);
            result[result.length] = prop;
        }
        return result;
    }
};
module.exports = Prophesy;