'use strict';

var SampleContract = function () {
};

SampleContract.prototype = {
    init: function () {
    },
    transfer: function (x) {
        var result;
        var value = Blockchain.transaction.value;
        var amount = new BigNumber(value).mul(1000000000000000000);
        var ret = Blockchain.verifyAddress(Blockchain.transaction.to);
        var to = "n1HZCH4mZKhU6CDCGry3qZKqeLNkZwoETna";
        result = Blockchain.transfer(to, amount);
        console.log("transfer result:", result);
        console.log("[87: 用户钱包地址 88: 合约地址 0: 地址非法]ret->" + ret);
        return result;

    }
};

module.exports = SampleContract;