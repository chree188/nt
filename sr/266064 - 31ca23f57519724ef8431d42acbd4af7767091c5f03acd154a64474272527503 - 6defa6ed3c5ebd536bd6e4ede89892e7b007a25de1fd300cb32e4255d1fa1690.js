'use strict';

var Contract = function () {
    LocalContractStorage.defineProperty(this, "limit", null);//个数限制
    LocalContractStorage.defineProperty(this, "fee", null);//上链费用限制
    LocalContractStorage.defineProperty(this, "company", null);//公司名称
    LocalContractStorage.defineProperty(this, "contributor", null);//合約发起人
    LocalContractStorage.defineProperty(this, "companiesboard", null);//已上联公司列表
};

Object.prototype.getKeyByValue = function (value) {
    for (var prop in this) {
        if (this.hasOwnProperty(prop)) {
            if (this[prop] == value)
                return prop;
        }
    } 
}


Contract.prototype = {
    init: function (limit,fee) {
        this.limit = new BigNumber(limit);
        this.fee=new BigNumber(fee)
        this.contributor = Blockchain.transaction.from;
        this.companiesboard = {};
        // this.vote("power by henry");
        return this.info();
    },
    info: function () {
        return this.companiesboard;
    },
    //申请加入榜单时调用
    apply: function(name,url){
        var amount = new BigNumber(Blockchain.transaction.value);
        let companiesboard = this.companiesboard;
        //当费用小于约定费用或者榜单已满限定值或名字已存在时将无法继续执行合约
        if(Object.keys(companiesboard).length == this.limit){
            throw new Error("Thank U for your applying,we are sorry to tell you that our board is completely full,see you next board ^_^.");
        }
        if(!url||url.length>2083||url.length<=5){
            throw new Error("Please commit an effective logo url(MORE THAN 5 AND LESS THAN 2083)"); 
        }
        if(name.length>9||name.length<=0){
            throw new Error("Please commit an effective name(less than 20 words and at least one word)");
        }
        if (companiesboard[name] || amount<this.fee ) {
                throw new Error("Oops,applying failed,your cost value must greater than the minimum apply cost and each name could only be applied once.");   
        } else {
            return this._append(name,url);
        }
    },
    //存储用户的名字和url
    _append: function (name,url) {
        let companiesboard = this.companiesboard;
        companiesboard[name] = url;
        this.companiesboard = companiesboard;
        return true;
    },
    takeout: function (amount) {
        var from = Blockchain.transaction.from;
        let value = new BigNumber(amount);
        if (from == this.contributor) {
            var result = Blockchain.transfer(from, value);
            if (!result) {
                throw new Error("transfer failed.");
            }
            Event.Trigger("BankVault", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: from,
                    value: value.toString()
                }
            });
        }
    }
};
module.exports = Contract;