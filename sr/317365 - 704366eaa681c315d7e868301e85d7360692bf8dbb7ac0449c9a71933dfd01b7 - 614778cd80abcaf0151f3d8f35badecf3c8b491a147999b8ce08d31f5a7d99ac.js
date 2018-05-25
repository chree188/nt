"use strict";

var PeopleConten = function (text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.name = obj.name;
		this.number = obj.number;
		this.sport = obj.sport;
		this.time = obj.time;
		this.lng = obj.lng;
		this.lat = obj.lat;
		this.message = obj.message;
	}else{
		this.key =  "";
		this.name =  "";
		this.number =  "";
		this.sport =  "";
		this.time =  "";
		this.lng =  "";
		this.lat =  "";
		this.message =  "";
	}
};

PeopleConten.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var SportCommunity = function () {
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this,"people",{
		parse: function(text){
			return new PeopleConten(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
   
};

SportCommunity.prototype = {
    init: function () {
        this.size = 0;
    },

    sign: function (key,name,number,sport,time,lng,lat,message) {
		
		//key = key.trim();
		name = name.trim();
		sport = sport.trim();
		lng = lng.trim();
		lat	= lat.trim();

		var people = new PeopleConten();
		people.key = this.size;
		people.name = name;
		people.number = number;
		people.sport = sport;
		people.time = time;
		people.lng = lng;
		people.lat = lat;
		people.message = message;
        this.people.put(this.size, people);
		this.size = this.size + 1;

    },
	
	 getinfo: function (max) {
		var message = [];
		var count = 0;
		for(var i= this.size; i >= 0 && count < max; i--,count++){
            var tmpkey = this.people.get(i);
			if(tmpkey){
				message.push(tmpkey);
			}
        }

		return message;
    },

	
	
};

module.exports = SportCommunity;