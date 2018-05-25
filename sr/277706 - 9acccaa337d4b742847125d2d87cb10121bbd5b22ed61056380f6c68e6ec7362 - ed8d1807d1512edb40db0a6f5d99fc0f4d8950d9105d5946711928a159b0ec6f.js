"use strict";

var PasswordItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.cipherPassword = obj.cipherPassword;
		this.description = obj.description;
	} else {
		this.cipherPassword = "";
	    this.description = "";
	}
};

PasswordItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BoxItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.owner = obj.owner;
		this.passwords = obj.passwords;
	} else {
	    this.owner = "";
	    this.passwords = new Array();
	}
};

BoxItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PasswordBox = function() {
	LocalContractStorage.defineMapProperty(this, "boxs", {
	    parse: function (text) {
	      return new BoxItem(text);
	    },
	    stringify: function (o) {
	      return o.toString();
	    }
	  });
};

PasswordBox.prototype =  {
	init: function () {

	},

	save: function(cipherPassword, description) {
		cipherPassword = cipherPassword.trim();
        description = description.trim();
        if (cipherPassword === "" || description === ""){
            throw new Error("empty cipherPassword / description");
        }

        var passwords;
        var from = Blockchain.transaction.from;
        var boxItem = this.boxs.get(from);

        if (boxItem){
            passwords = boxItem.passwords;
        } else {
			boxItem = new BoxItem();
			passwords = new Array();
        }

        var passwordItem = new PasswordItem();
        passwordItem.cipherPassword = cipherPassword;
        passwordItem.description = description;

        passwords.push(passwordItem);


        boxItem.owner = from;
        boxItem.passwords = passwords;

        this.boxs.delete(from);
        this.boxs.put(from, boxItem);
	},

	get: function () {
		var from = Blockchain.transaction.from;
        
        return this.boxs.get(from);
    }
};

module.exports = PasswordBox;