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
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }

        var from = Blockchain.transaction.from;
        var MessageItem = this.repo.get(key);
        if (MessageItem){
            throw new Error("value has been occupied");
        }

        MessageItem = new MessageItem();
        MessageItem.author = from;
        MessageItem.key = key;
        MessageItem.value = value;

        this.repo.put(key, MessageItem);
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