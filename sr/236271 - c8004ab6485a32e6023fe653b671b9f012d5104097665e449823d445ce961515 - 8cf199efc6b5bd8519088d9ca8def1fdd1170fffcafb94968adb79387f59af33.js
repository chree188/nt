"use strict";

var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.fromName = obj.fromName;
        this.toName = obj.toName;
        this.content = obj.content;
        this.address = obj.address;
        this.value = obj.value;  // value => how many rose
        this.index = obj.index;  // index is used to modify rose
        this.timestamp = obj.timestamp;
    } else {
        this.fromName = "";
        this.toName = "";
        this.content = "";
        this.address = "";
        this.value = "";
        this.index = 0;  
        this.timestamp = 0;
    }
};

DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var NasRoseContract = function(){
    LocalContractStorage.defineMapProperty(this, "roseArray");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "owner");
    LocalContractStorage.defineProperty(this, "balance");
};

NasRoseContract.prototype = {
    init: function () {
        this.size = 0;
        this.owner = Blockchain.transaction.from;
        this.balance = "0";
    },
    getOwner: function() {
        return this.owner;
    },
    totalBalance: function() {
        return this.balance;
    },
    withdrawAmount: function(nasAmount) {
        //only contract owner can withdraw
        if (this.owner != Blockchain.transaction.from) {
            throw new Error("only owner can withdraw");
        }
        var totalBalance = new BigNumber(this.balance);
        nasAmount = new BigNumber(nasAmount);
        if (nasAmount.gt(totalBalance)) {
            throw new Error("invalid nasAmount");
        }
        Blockchain.transfer(this.owner, nasAmount);
        totalBalance = totalBalance.minus(nasAmount);
        this.balance = totalBalance.toString();
    },
    withdrawAll: function() {
        //only contract owner can withdraw
        if (this.owner != Blockchain.transaction.from) {
            throw new Error("only owner can withdraw");
        }
        var totalBalance = new BigNumber(this.balance);
        Blockchain.transfer(this.owner, totalBalance);
        this.balance = "0";
    },
    modifyRose: function(index, fromName, toName, content) {
        //only contract owner can modify rose
        if (this.owner != Blockchain.transaction.from) {
            throw new Error("only owner can modify rose");
        }
        if (index >= this.size) {
            throw new Error("invalid index");
        }
        var roseItem = this.roseArray.get(index);
        roseItem.fromName = fromName;
        roseItem.toName = toName;
        roseItem.content = content;
        this.roseArray.set(index, roseItem);
    },
    buyRose: function (fromName, toName, content) {
        fromName = fromName.trim();
        toName = toName.trim();
        content = content.trim();
        if (fromName === "" || toName === "" || content === ""){
            throw new Error("empty fromName / toName / content");
        }
        if (fromName.length > 64 || toName.length > 64){
            throw new Error("fromName / toName exceed limit length");
        }
        var totalBalance = new BigNumber(this.balance);
        var buyValue = new BigNumber(Blockchain.transaction.value);

        var roseNumber = buyValue.div(1000000000000000).toFixed(0).toString();
        roseNumber = parseInt(roseNumber);
        if (roseNumber <= 0) {
            throw new Error("roseNumber is less than 1")
        }

        var roseItem = new DictItem();
        roseItem.fromName = fromName;
        roseItem.toName = toName;
        roseItem.content = content;
        roseItem.address = Blockchain.transaction.from;
        roseItem.value = roseNumber;
        roseItem.index = this.size;
        roseItem.timestamp = Date.now();

        // update balance
        totalBalance = totalBalance.plus(buyValue);
        this.balance = totalBalance.toString();
        
        // add rose to blockchain
        var index = this.size;
        this.roseArray.set(index, roseItem);
        this.size +=1;
    },
    getAllRose: function() {
        var tempRoseArray = [];
        for(var index=0;index<this.size;index++){
            tempRoseArray.push(this.roseArray.get(index));
        }
        return tempRoseArray;
    },
    getRose: function(index) {
        if (index >= this.size) {
            throw new Error("invalid id");
        }

        var tempRoseArray = [];
        for(var i=0;i<this.size;i++){
            tempRoseArray.push(this.roseArray.get(i));
        }

        tempRoseArray.sort(function(a,b) {
            return (b.value - a.value);
        });
        return tempRoseArray[index];
    },
    getTotal:function(){
        return this.size;
    }
};
module.exports = NasRoseContract;