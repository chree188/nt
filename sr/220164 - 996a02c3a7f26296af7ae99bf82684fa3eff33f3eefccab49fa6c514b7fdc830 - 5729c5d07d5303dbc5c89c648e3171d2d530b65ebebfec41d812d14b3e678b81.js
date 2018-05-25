"use strict";

var housekeeper = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.phoneOrEmail = obj.phoneOrEmail;
		this.secret = obj.secret;
		this.owner = obj.owner;
	} else {
        this.phoneOrEmail = '';
        this.secret = '';
        this.owner = '';
	}
};

housekeeper.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var secretKeyManager = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new housekeeper(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

secretKeyManager.prototype = {
    init: function () {
        // todo
    },

    save: function (phoneOrEmail, secret) {

        phoneOrEmail = phoneOrEmail.trim();
        secret = secret.trim();
        if (phoneOrEmail === "" || secret === ""){
            throw new Error("empty phoneOrEmail or  secret");
        }
        if (phoneOrEmail.length > 512 || secret.length > 512){
            throw new Error("phoneOrEmail / secret exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var secretVaule = this.repo.get(phoneOrEmail);
        if (secretVaule){
            throw new Error("secretVaule has been occupied");
        }

        housekeeper = new housekeeper();
        housekeeper.owner = from;
        housekeeper.phoneOrEmail = phoneOrEmail;
        housekeeper.secret = secret;

        this.repo.put(phoneOrEmail, housekeeper);
    },

    get: function (phoneOrEmail) {
        phoneOrEmail = phoneOrEmail.trim();
        if ( phoneOrEmail === "" ) {
            throw new Error("empty phoneOrEmail")
        }
        return this.repo.get(phoneOrEmail);
    }
};
module.exports = secretKeyManager;