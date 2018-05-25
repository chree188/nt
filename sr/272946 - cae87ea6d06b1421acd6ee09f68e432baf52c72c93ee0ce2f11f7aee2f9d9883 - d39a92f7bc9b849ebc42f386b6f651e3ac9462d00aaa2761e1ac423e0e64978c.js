"use strict";

var LoginItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.nickname = obj.nickname;
	} else {
	    this.key = ""; 
	    this.value = "";
	    this.nickname = "";
	}
};

LoginItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LoginProperty = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new LoginItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LoginProperty.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        var keypassword = key+""+value;
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length");
        }

        var from = Blockchain.transaction.from;
//      if(key!=from)
//      {
//      	throw new Error("钱包地址不一致！");
//      }
        var loginItem = this.repo.get(keypassword);
        if (loginItem){
            throw new Error("user has been registed");
        }

        loginItem = new LoginItem();
        loginItem.key = from;
        loginItem.value = value;
        loginItem.nickname = "";

        this.repo.put(keypassword, loginItem);
    },

    get: function (key,value) {
        key = key+""+value;
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = LoginProperty;