"use strict";

var Person = function(text) {
	if (text) {
		var obj = JSON.parse(text);
	  this.idCard = obj.idCard
		this.description =  obj.description
	  this.author = obj.author
	} else {
		this.description =  ""
		this.idCard = ""
		this.author = ""
	}
};

Person.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SearchMissingPerson = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Person(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SearchMissingPerson.prototype = {
    init: function () {
        // todo
    },

    save: function (idCard,description) {
        idCard = idCard.trim();
				description = description.trim();

        if (idCard === "" || description === ""){
            throw new Error("输入为空");
        }
        if (idCard.length > 20 || description.length > 200){
            throw new Error("输出内容过长")
        }

        var from = Blockchain.transaction.from;
        var person = this.repo.get(idCard);
        if (person){
            throw new Error("此身份证号已经添加过!!");
        }

        person = new Person();
        person.author = from;
        person.idCard = idCard;
        person.description = description;

        this.repo.put(idCard, person);
    },

    get: function (idCard) {
        idCard= idCard.trim();
        if ( idCard === "" ) {
            throw new Error("输入为空")
        }
        return this.repo.get(idCard);
    }
};
module.exports = SearchMissingPerson;