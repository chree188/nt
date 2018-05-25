"use strict"
var DepositeContent = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.balance = new BigNumber(o.balance);
    } else {
        this.balance = new BigNumber(0);
    }
};

/**
 * 广告对象
 * @param text
 * @constructor
 */
var Advertisement = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.key = o.key;
        this.title = o.title;
        this.content = o.content;
    } else {
        this.key = "";
        this.title = "";
        this.content = "";
    }
};

DepositeContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

/**
 * 扫雷智能合约
 * @constructor
 */
var SaoLeiContract = function () {
    LocalContractStorage.defineMapProperty(this, "saoLei", {
        parse: function (text) {
            return new DepositeContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "addressMap");
    LocalContractStorage.defineMapProperty(this, "userMap");

    //广告系统
    LocalContractStorage.defineMapProperty(this, "advertisement", {
        parse: function (text) {
            return new Advertisement(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperty(this, "count");
    LocalContractStorage.defineProperty(this, "adminAddress");
    LocalContractStorage.defineProperty(this, "contractBalance");


};

SaoLeiContract.prototype = {

    init: function () {
        this.count = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.contractBalance = new BigNumber(0);
    },

    /**
     * 推送广告
     */
    advertisingPush: function (title, content) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        console.log("用户广告推送, 花费nas数量：" + value);

        this._setContractBalance(value);

        var ad = new Advertisement();
        ad.title = title;
        ad.content = content;
        ad.key = from;

        this.advertisement.put(from, ad);

    },

    /**
     * 游戏结束
     * @param value
     * @param time
     */
    afterGame: function (value, time) {

        console.log("扫雷游戏结束");

        var from = Blockchain.transaction.from;
        var amount = new BigNumber(value);

        var deposit = this.saoLei.get(from);
        if (deposit) {
            amount = amount.plus(deposit.balance);
        }

        var deposit = new DepositeContent();
        deposit.balance = amount;

        this.saoLei.put(from, deposit);

        if(new BigNumber(value).gt(new BigNumber(0))){
            this.addUser(from + this.count, from + "中奖了" + value/1e18 + "NAS,耗时" + time);
        }
    },

    /**
     * 用户余额
     */
    withDrawBalace: function () {

        var from = Blockchain.transaction.from;

        var deposit = this.saoLei.get(from);
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
        Event.Trigger("SaoLei", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount.toString()
            }
        });

        deposit.balance = deposit.balance.sub(amount);
        this.saoLei.put(from, deposit);

        this._setContractBalance(-amount);

        this.addUser(from + this.count, from + "提现了" + amount/1e18 + "NAS");
    },

    balanceOf: function () {

        var from = Blockchain.transaction.from;
        return this.saoLei.get(from);
    },


    addUser: function(key, value){

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

        var result =[];
        for(var i = 0; i < this.count; i++){

            var key = this.addressMap.get(i);
            var object = this.userMap.get(key);
            result.push(object);
        }

        return result;
    },

    getUserCount : function(){
        return this.count;
    }

};

module.exports = SaoLeiContract;