"use strict";

var Advertise = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.date = obj.date;
		this.phone = obj.phone;
		this.advertise = obj.advertise;
		this.author = obj.author;
	} else {
	    this.name = "";
	    this.date = "";
	    this.phone = "";
	    this.advertise = "";
	    this.author = "";
	}
};

Advertise.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LostProperty = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Advertise(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineProperty(this, "size");
};

LostProperty.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (name, date, phone, advertise) {
		var index = this.size;
               var from = Blockchain.transaction.from;
		var property = new Advertise();
        	property.author = from;
        	property.name = name;
        	property.date = date;
		property.phone = phone;
		property.advertise = advertise;

        	this.repo.put(index, property);
		this.size +=1;
    },

    get: function (index) {
        if ( index >= this.size ) {
            throw new Error("index is not valid")
        }
        return this.repo.get(index);
    },

	len:function(){
		return this.size;
    },

    forEach: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = new Array();
        for(var i=offset;i<number;i++){
            var obj = this.repo.get(i);
            result.push(obj);
        }
        return result;
    }
};
module.exports = LostProperty;