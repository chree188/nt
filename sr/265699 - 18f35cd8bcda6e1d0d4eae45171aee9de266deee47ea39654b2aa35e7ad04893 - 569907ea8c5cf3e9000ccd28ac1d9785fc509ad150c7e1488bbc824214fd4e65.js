"use strict";

var Pledge = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.man_name = obj.man_name;
		this.man_content = obj.man_content;
        this.woman_name = obj.woman_name;
        this.woman_content = obj.woman_content;
        this.date = obj.date;
	} else {
	    this.man_name = "";
	    this.man_content = "";
        this.woman_name = "";
        this.woman_content = "";
        this.date = new Date();
	}
};

Pledge.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var Certificate = function () {
    LocalContractStorage.defineMapProperty(this, "pledge", {
        parse: function (text) {
            return new Pledge(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

Certificate.prototype = {
    init: function () {},

    save: function (index,man_name, woman_name,man_content,woman_content) {

        man_name = man_name.trim();
        woman_name = woman_name.trim();
        if (man_name === "" || woman_name === ""){
            throw new Error("empty name");
        }        
        if (man_name.length > 64 || woman_name.length > 64){
            throw new Error("name exceed limit length")
        }

        var pledge = this.pledge.get(index);
        if (pledge){
            throw new Error("index has been occupied");
        }

        pledge = new Pledge();
        pledge.man_name = man_name;
        pledge.man_content = man_content;
        pledge.woman_name = woman_name;
        pledge.woman_content = woman_content;
        pledge.date = new Date();
        this.pledge.put(index, pledge);
    },

    get: function (index) {
        return this.pledge.get(index);
    },
};
module.exports = Certificate;