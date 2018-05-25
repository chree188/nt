"use strict"
var DepositeContent = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.balance = new BigNumber(o.balance);
    } else {
        this.balance = new BigNumber(0);
    }
};

DepositeContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TurnTableContract = function () {
    LocalContractStorage.defineMapProperty(this, "turnTable", {
        parse: function (text) {
            return new DepositeContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "addressMap");
    LocalContractStorage.defineMapProperty(this, "userMap");

    LocalContractStorage.defineProperty(this, "count");
    LocalContractStorage.defineProperty(this, "adminAddress");
    LocalContractStorage.defineProperty(this, "contractBalance");

};

TurnTableContract.prototype = {

    init: function () {
        this.count = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.contractBalance = new BigNumber(0);
    },

    reCharge: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        console.log("用户充值,值为：" + value);

        this._setContractBalance(value);

        var orig_deposit = this.turnTable.get(from);
        if (orig_deposit) {
            value = value.plus(orig_deposit.balance);
        }

        var deposit = new DepositeContent();
        deposit.balance = value;

        this.turnTable.put(from, deposit);

        this._addUser(from + this.count, from + "充值了" + Blockchain.transaction.value/1e18 + "nas，账户余额为：" + value/1e18 + "nas");
    },

    afterAward: function (value) {

        console.log("用户抽奖结束，入参为：" + value);

        var from = Blockchain.transaction.from;
        var amount = new BigNumber(value);

        var deposit = this.turnTable.get(from);
        if (!deposit) {
            throw new Error("No deposit before.");
        }else {

            amount = amount.plus(deposit.balance);
        }

        var deposit = new DepositeContent();
        deposit.balance = amount;

        this.turnTable.put(from, deposit);

        if(new BigNumber(value).gt(new BigNumber(0))){
            this._addUser(from + this.count, from + "恭喜获奖，奖金为" + value/1e18 + "nas");
        }else{
            this._addUser(from + this.count, from + "很遗憾，没有获奖");
        }
    },

    withDrawAll: function () {

        var from = Blockchain.transaction.from;

        var deposit = this.turnTable.get(from);
        if (!deposit) {
            throw new Error("No deposit before.");
        }
        var amount = deposit.balance;

        if(amount.gt(this.contractBalance)){
            amount = this.contractBalance;
        }

        var result = Blockchain.transfer(from, amount);
        if (!result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("TurnTable", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount.toString()
            }
        });

        deposit.balance = deposit.balance.sub(amount);
        this.turnTable.put(from, deposit);

        this._setContractBalance(-amount);

        this._addUser(from + this.count, from + "用户提现" + amount/1e18 + "nas");
    },

    getAdminAddress: function() {
        return this.adminAddress;
    },

    balanceOf: function () {

        var from = Blockchain.transaction.from;
        return this.turnTable.get(from);
    },

    transfer: function(amount) {

        if (Blockchain.transaction.from === this.adminAddress) {
            Blockchain.transfer(this.adminAddress, amount);
            Event.Trigger('transfer', {
                to: this.adminAddress,
                value: amount
            });
        } else {
            throw new Error("Admin only");
        }
    },

    _addUser: function(key, value){

        var index = this.count;
        this.addressMap.set(index, key);
        this.userMap.set(key, value);
        this.count +=1 ;
    },

    _setContractBalance : function (value) {
        var amount = new BigNumber(this.contractBalance);

        amount = amount.plus(value);

        this.contractBalance = amount;
    },

    getContractBalance : function () {

        return this.contractBalance;
    },

    getAllUser: function(){

        var result = "";
        for(var i = 0; i < this.count; i++){

            var key = this.addressMap.get(i);
            var object = this.userMap.get(key);
            result += "index:" + i + " key:" + key + " value:" + object + "_";
        }

        return result;
    },

    getUserCount : function(){
        return this.count;
    }

};


module.exports = TurnTableContract;