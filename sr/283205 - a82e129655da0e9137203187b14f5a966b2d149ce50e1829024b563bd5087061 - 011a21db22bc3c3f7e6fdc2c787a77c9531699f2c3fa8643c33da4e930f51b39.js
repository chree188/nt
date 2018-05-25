"use strict";

var beg = function () {
    LocalContractStorage.defineProperty(this,"begger");
    LocalContractStorage.defineProperty(this,"total");
    LocalContractStorage.defineProperty(this,"cur");
};

beg.prototype = {
    init: function (address,val) {
        this.begger=address;
        this.total=new BigNumber(val);
        this.cur=new BigNumber(0);
    },
    count: function(){
        var value = Blockchain.transaction.value;
        value = new BigNumber(value);
        this.total=new BigNumber(this.total).plus(value);
        this.cur=new BigNumber(this.cur).plus(value);
    },
    transfer: function () {
        this.count();
        var result = Blockchain.transfer(this.begger, this.cur);
        this.cur=new BigNumber(0);
        return result;
    },
    transferV: function (value) {
        this.count();
        var result = Blockchain.transfer(this.begger, value*1000000000000000000);
        this.cur=new BigNumber(0);
        return result;
    },
    accept: function () {
        this.transfer();
        this.count();

    },
    get:function () {
        this.transfer();
        this.count();

        return this.total;
    }

};
module.exports = beg;