"use strict";

var Kitty = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.gene = obj.gene;
		this.birth = obj.birth;
		this.owner = obj.owner;
	} else {
	    this.gene = "";
	    this.birth = "";
	    this.owner = "";
	}
};


Kitty.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var KittyAdopt =function(){

    LocalContractStorage.defineMapProperty(this, "ownerToIndex");
    LocalContractStorage.defineProperties(this, {
        builder: null,
        balance:null,
        kittyIndex:null
    });
    LocalContractStorage.defineMapProperty(this, "kitties", {
        parse: function (text) {
            return new Kitty(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

KittyAdopt.prototype={
    init: function () {
        this.builder= Blockchain.transaction.from; 
        this.kittyIndex=0;
        this.balance=0;
    },
    getAccount:function(){
        var result={};
        var from=Blockchain.transaction.from;
        result['builder']=from===this.builder;
        result['account']=from;
        return result;
    },
    _verAddress:function(addr){
        if (!Blockchain.verifyAddress(addr)) {//1=success
            throw new Error("account address error")
        }
    },
    _isBuilder:function(addr){
        this._verAddress(addr);
        if(addr!==this.builder){
            throw new Error("you have no permission")
        }
    },
    
    createKitty:function(gene){
        var from=Blockchain.transaction.from;
        this._isBuilder(from);
        if(gene==""){
            gene=Blockchain.transaction.hash;
        }
        var kitty=new Kitty();
        kitty.birth=Blockchain.transaction.timestamp;
        kitty.gene=gene;
        kitty.owner=from;
        this.kittyIndex++;
        this.ownerToIndex.set(kitty.owner,this.kittyIndex);
        this.kitties.put(this.kittyIndex,kitty);
    },
    getAdKitties:function(){
       return this.getKitties(this.builder);
    },
    getKitties:function(owner){
        var kittyarr=[];
        owner=owner.trim();
        this._verAddress(owner);
        for (var i = 1; i <= this.kittyIndex; i++) {
            var kitty = this.kitties.get(i);
            var k={};
            if (kitty.owner===owner) {
                k.id=i;
                k.gene=kitty.gene;
                k.birth=kitty.birth;
                kittyarr.push(k);
            }
        }
        return kittyarr;
    },
    getKittyById:function(id){
        return this.kitties.get(id);
    },
    adoptKitty:function(id){
        var from=Blockchain.transaction.from;
        if (this.ownerToIndex.get(from)) {
            throw new Error('you only have one kitty')
        }
        var kitty=this.kitties.get(id);
        this._isBuilder(kitty.owner);
        
        kitty.owner=from;
        this.ownerToIndex.set(from,id);
        this.kitties.put(id,kitty);
    },
    unAdoptKitty:function(id){
        var kitty=this.kitties.get(id);
        var from=Blockchain.transaction.from;
        if (kitty.owner!==from) {
            throw new Error('kitty owner error!')
        }
        kitty.owner=this.builder;
        this.ownerToIndex.set(this.builder,id);
        this.ownerToIndex.del(from);
        this.kitties.put(id,kitty);
    }


}

module.exports = KittyAdopt;
