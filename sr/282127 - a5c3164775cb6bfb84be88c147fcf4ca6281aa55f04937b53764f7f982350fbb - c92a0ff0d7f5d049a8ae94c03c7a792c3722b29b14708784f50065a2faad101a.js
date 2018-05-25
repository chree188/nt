'use strict';

//消息
var FTContract = function () {
    LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineProperty(this, "pay"); //进门价格
};

FTContract.prototype = {

    init: function () {
        this.pay = 0.01;
    },
    //玩
    play: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value != this.pay * 1000000000000000000) {
            throw new Error("Sorry, please pay " + this.pay + " NAS only.");
        }
    }
};

module.exports = FTContract;