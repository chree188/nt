
// 合约地址: n1tyyEu1Ra7tSFhtwZkybemMUqFBfouikaA
// 部署交易 hash: 433e1a03840b521784719418cfae1fdb34e95239a329530c1e6b7c8fda2cbac8 

"use strict";
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