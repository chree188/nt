
// 合约地址: n1ydF2rwWdgoodWiC4YjWPiBeXDYRw7xhYy
// 部署交易 hash: 982b19b0037805d4eedf0cbe19336c9168326ddfb3067a90f91d68909de58b52 

"use strict";
var LockItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.boy = obj.boy||"";
        this.girl = obj.girl||"";
        this.proof = obj.proof||"";
        this.author = obj.author || "";
		this.lockhash = this.boy+ '&' + this.girl;
	} else {
        this.boy = "";
		this.girl = "";
        this.proof = "";
        this.author = "";
		this.lockhash = "";
	}
};

LockItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LoveLock = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new LockItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LoveLock.prototype = {
    init: function () {
        // todo
    },

    save: function (boy, girl, proof) {

        var boy = boy.trim();
        var girl = girl.trim();
        var proof = proof.trim();
        if (girl === "" || boy === ""){
            throw new Error("name is empty");
        }
        if (girl.length > 20 || boy.length > 20 || proof.length > 40){
            throw new Error("value exceed limit length")
        }
        var lockhash = boy+ '&' + girl;

        var from = Blockchain.transaction.from;
        var item = this.repo.get(lockhash);
        if (item){
            throw new Error("value has been occupied");
        }

        item = new LockItem();
        item.girl = girl;
        item.boy = boy;
        item.proof = proof;
        item.author = from;
        item.lockhash = lockhash;

        this.repo.put(lockhash, item);
    },

    get: function (lockhash) {
        var lockhash = lockhash.trim();
        if ( lockhash === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(lockhash);
    }
};
module.exports = LoveLock;