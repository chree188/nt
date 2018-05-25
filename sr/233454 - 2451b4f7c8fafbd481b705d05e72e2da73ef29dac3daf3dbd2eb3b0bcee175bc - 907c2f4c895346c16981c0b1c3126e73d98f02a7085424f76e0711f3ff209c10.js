"use strict";

var Person = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.phone = obj.phone;
		this.sex = obj.sex;
        this.address = obj.address;
        this.company = obj.company;
        this.remark = obj.remark;
        this.author = obj.author;
	} else {
        this.name = "";
        this.phone = "";
        this.sex = "";
        this.address = "";
        this.company = "";
        this.remark = "";
        this.author = "";
	}
};

Person.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PersonRecoder = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Person(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PersonRecoder.prototype = {
    init: function () {
        // none
    },

    save: function (name, phone, sex, address, company, remark) {
        name = name.trim();
        phone = phone.trim();
        if (name === "" || phone === ""){
            throw new Error("name / phone cannot be empty");
        }
        if (name.length > 64 || phone.length > 64){
            throw new Error("name / phone exceed limit length 64")
        }

        var from = Blockchain.transaction.from;
        var person = this.repo.get(name);
        if (person){
            throw new Error("person has been recorded");
        }

        person = new Person();
        person.author = from;
        person.name = name;
        person.phone = phone;
        person.sex = sex;
        person.address = address;
        person.company = company;
        person.remark = remark;

        this.repo.put(name, person);
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.repo.get(name);
    }
};
module.exports = PersonRecoder;