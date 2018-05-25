"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.num = obj.num;
		this.name = obj.name;
		this.id = obj.id;
		this.school = obj.school;
		this.major = obj.major;
		this.time = obj.time;
	} else {
	    this.num = "";
	    this.name = "";
	    this.id = "";
		this.school = "";
		this.major = "";
		this.time ="";
		
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Certification = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
LocalContractStorage.defineProperty(this,"control")
};

Certification.prototype = {
    init: function () {
		this.control="n1aKabzxx8afzAbTe5f2ghYX7kvUJEMizNE";
        // todo
    },

    save: function (num,name,id,school,major,time) {
        var from = Blockchain.transaction.from;
		var strfrom=JSON.stringify(from);
		var strcontrol=JSON.stringify(this.control);
		
	    if(strcontrol == strfrom)
		{
        num= num.trim();
        name = name.trim();
		school = school.trim();
		major = major.trim();
		id = id.trim();
		time=time.trim();
        if (num === "" || name === ""){
            throw new Error("empty key / value");
        }
        if (num.length > 64 || name.length > 64){
            throw new Error("key / value exceed limit length")
        }

       // var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(num);
        if (dictItem){
            throw new Error("value has been occupied");
        }

        dictItem = new DictItem();
        dictItem.num = num;
        dictItem.time = time;
        dictItem.id = id;
		dictItem.school = school;
		dictItem.major = major;
		dictItem.name = name;

        this.repo.put(num, dictItem);}
		else
		{
			throw new Error("illegal account");
			
		}
    },

    get: function (num) {
        num = num.trim();
        if ( num === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(num);
    }
};
module.exports = Certification;