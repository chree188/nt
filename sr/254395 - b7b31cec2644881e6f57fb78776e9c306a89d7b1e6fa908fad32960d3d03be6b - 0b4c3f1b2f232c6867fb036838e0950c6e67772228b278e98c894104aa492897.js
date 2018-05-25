
// 合约地址: n1yBorU48G9hnSrwfVLjDsLLtGtXphw4Dmg
// 部署交易 hash: 507ade015c119c38cd455568efc12e433e7d5c522c3723f4a210ac05d457e0e6 

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
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new LockItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

LoveLock.prototype = {
    init: function () {
        this.size = 0;
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

        var index = this.size;
        this.arrayMap.set(index, lockhash);
        // this.dataMap.set(lockhash, item);
        this.repo.put(lockhash, item);
        this.size +=1;
    },

    len:function(){
        return this.size;
    },

    get: function (lockhash) {
        var lockhash = lockhash.trim();
        if ( lockhash === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(lockhash);
        // return this.dataMap.get(lockhash);
    },

    forEach: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = [];
        for(var i=offset;i<number;i++){
            var lockhash = this.arrayMap.get(i);
            var object = this.dataMap.get(lockhash);
            result.push(object);
        }
        return JSON.stringify(result);
    }
};
module.exports = LoveLock;