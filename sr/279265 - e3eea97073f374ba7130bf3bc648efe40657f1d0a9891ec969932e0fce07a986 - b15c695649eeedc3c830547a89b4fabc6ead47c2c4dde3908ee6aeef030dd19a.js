"use strict";

var LoverItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.lover = obj.lover;
		this.startTime = obj.startTime;
		this.me = obj.me;
	} else {
	    this.lover = "";
	    this.startTime = "";
	    this.me = "";
	}
};

LoverItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LoverContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new LoverItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LoverContract.prototype = {
    init: function () {
        // todo
    },

    save: function (lover, startTime, me) {

        lover = lover.trim();
        startTime = startTime.trim();
        me = me.trim();
        if (lover === ""){
            throw new Error("please input your lover name");
        }
        if(startTime === ""){
            throw new Error("please input your startime");
        }
        if(me === ""){
            throw new Error("please input your name");
        }
        if (lover.length > 5 || me.length > 5){
            throw new Error("limit 5 charset")
        }

        var from = Blockchain.transaction.from;
        var loverItem = this.repo.get(from);
        if (loverItem){
            throw new Error("value has been occupied");
        }

        loverItem = new LoverItem();
        loverItem.lover = lover;
        loverItem.startTime = startTime;
        loverItem.me = me;

        this.repo.put(from, loverItem);
        return from;
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("please input nas wallet address")
        }
        return this.repo.get(key);
    }
};
module.exports = LoverContract;
