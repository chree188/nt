"use strict";

var MessageItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        this.key = obj.key;
        this.name = obj.name;
        this.msg = obj.msg;
        this.pwdhint = obj.pwdhint;
        this.errorhint = obj.errorhint;
        this.pwd = obj.pwd;
	} else {
	    this.key = "";
        this.name = "";
        this.msg = "";
        this.pwdhint = "";
        this.errorhint = "";
        this.pwd = "";
	}
};

MessageItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var DialogGame = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new MessageItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

DialogGame.prototype = {
    init: function () {
        // todo
    },

    save: function (key, name, msg, pwdhint, errorhint, pwd) {

        key = key.trim();
        name = name.trim();
        msg = msg.trim();
        pwdhint = pwdhint.trim();
        errorhint = errorhint.trim();
        pwd = pwd.trim();
        if (key === "" || name === "" || msg === ""){
            throw new Error("empty key / name / msg when save");
        }

        var from = Blockchain.transaction.from;
        var messageItem = this.repo.get(key);
        if (messageItem){
            throw new Error("name has been occupied");
        }

        messageItem = new MessageItem();
        //messageItem.author = from;
        messageItem.key = key;
        messageItem.name = name;
        messageItem.msg = msg;
        messageItem.pwdhint = pwdhint;
        messageItem.errorhint = errorhint;
        messageItem.pwd = pwd;

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
module.exports = DialogGame;