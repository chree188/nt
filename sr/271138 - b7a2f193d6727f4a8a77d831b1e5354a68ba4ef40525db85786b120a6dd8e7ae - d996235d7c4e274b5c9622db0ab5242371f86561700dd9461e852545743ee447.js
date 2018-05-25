"use strict";

var CertifyItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.num = obj.num;
		this.name = obj.name;
		this.id = obj.id;
		this.publish = obj.publish;
		this.major = obj.major;
		this.time = obj.time;
	} else {
	    this.num = "";
	    this.name = "";
	    this.id = "";
		this.publish = "";
		this.major = "";
		this.time ="";
		
	}
};

CertifyItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Certification = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new CertifyItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
LocalContractStorage.defineProperty(this,"control")
};

Certification.prototype = {
    init: function () {
		this.control="n1FsMRiAFkT8rDyoGoF3FV2PbNUnBixLtbQ";
        // todo
    },
	check:function(){
		var from = Blockchain.transaction.from;
		var strfrom=JSON.stringify(from);
		var strcontrol=JSON.stringify(this.control);
		 if(strcontrol == strfrom)
		{return true;}
	else
	{return false;}
	},

    save: function (num,name,id,major,time,publish) {
        var from = Blockchain.transaction.from;
		var strfrom=JSON.stringify(from);
		var strcontrol=JSON.stringify(this.control);
		
	    if(strcontrol == strfrom)
		{
        num= num.trim();
        name = name.trim();
		publish = publish.trim();
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

        dictItem = new CertifyItem();
        dictItem.num = num;
        dictItem.time = time;
        dictItem.id = id;
		dictItem.publish = publish;
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