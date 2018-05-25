"use strict";


var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.userName = obj.userName;
		this.pass = obj.pass;
		this.tel = obj.tel;
	} else {
	    this.userName = "";
	    this.tel = "";
	    this.pass = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperDictionary.prototype = {
    init: function () {
        // todo
    },

    save: function (userName, pass,tel) {

        userName = userName.trim();
        pass = pass.trim();
        if (userName === "" || pass === ""){
            throw new Error("empty userName / pass");
        }
        if (pass.length > 10 || userName.length > 10){
            throw new Error("userName / pass exceed limit length");
        }
        if (tel == "" && tel.length != 11)
        {
            throw new Error("tel is error");
        }
        var dictItem = this.repo.get(userName);
        if (dictItem){
            throw new Error("user has been occupied");
        }

        dictItem = new DictItem();
        dictItem.tel = tel;
        dictItem.userName = userName;
        dictItem.pass = pass;

        this.repo.put(userName, dictItem);
    },

    get: function (userName) {
        userName = userName.trim();
        if ( userName === "" ) {
            throw new Error("empty userName")
        }
        return this.repo.get(userName);
    }
};
module.exports = SuperDictionary;