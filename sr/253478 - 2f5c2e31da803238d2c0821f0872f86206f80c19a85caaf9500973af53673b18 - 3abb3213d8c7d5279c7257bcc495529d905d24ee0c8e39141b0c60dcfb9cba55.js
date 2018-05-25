"use strict";

// 合约地址: n1jX2F6Q6Fz7JAhapj3eLcxZt64YdF9Jn1q
// 部署交易 hash: 19427c6ea560ac578ef54b843c8d826d2e0567c12fe41a732c6b56de67c07702
var LockItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.boy = obj.boy||"";
        this.girl = obj.girl||"";
        this.proof = obj.proof||"";
		this.lockhash = this.boy+ '&' + this.girl;
	} else {
        this.boy = "";
		this.girl = "";
        this.proof = "";
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

    save: function (girl, boy, proof) {

        girl = girl.trim();
        boy = boy.trim();
        proof = proof.trim();
        if (girl === "" || boy === ""){
            throw new Error("name is empty");
        }
        if (girl.length > 20 || boy.length > 20 || proof.length > 40){
            throw new Error("value exceed limit length")
        }
        lockhash = girl+ '&' + boy;

        var from = Blockchain.transaction.from;
        var item = this.repo.get(lockhash);
        if (item){
            throw new Error("value has been occupied");
        }

        item = new LockItem();
        item.girl = girl;
        item.boy = boy;
        item.proof = proof;
        item.lockhash = lockhash;

        this.repo.put(lockhash, item);
    },

    get: function (lockhash) {
        lockhash = lockhash.trim();
        if ( lockhash === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(lockhash);
    }
};
module.exports = LoveLock;