"use strict";

var MessageItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	}
};

MessageItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SecretMessage = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new MessageItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SecretMessage.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }

        var from = Blockchain.transaction.from;
        var messageItem = this.repo.get(key);
        if (messageItem){
            throw new Error("value has been occupied");
        }

        messageItem = new MessageItem();
        messageItem.author = from;
        messageItem.key = key;
        messageItem.value = value;

        this.repo.put(key, messageItem);
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