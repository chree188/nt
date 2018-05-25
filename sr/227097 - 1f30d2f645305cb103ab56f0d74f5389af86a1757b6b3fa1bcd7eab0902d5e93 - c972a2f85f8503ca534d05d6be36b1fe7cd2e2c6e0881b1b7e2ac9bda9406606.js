"use strict";

var Message = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.message = obj.message;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
	    this.message = "";
	}
};

Message.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SecretMessage = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Message(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SecretMessage.prototype = {
    init: function () {
    },

    save: function (key, message) {

        key = key.trim();
        if (key === "" || message === ""){
            throw new Error("empty key / message");
        }

        var from = Blockchain.transaction.from;
        var Message = this.repo.get(key);
        if (Message){
            throw new Error("key has been occupied");
        }

        Message = new Message();
        Message.author = from;
        Message.key = key;
        Message.message = value;

        this.repo.put(key, Message);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = SecretMessage;