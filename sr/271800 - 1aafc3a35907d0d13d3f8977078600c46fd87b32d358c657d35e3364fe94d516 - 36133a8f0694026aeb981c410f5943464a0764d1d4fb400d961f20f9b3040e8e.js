'use strict';
var SampleContract = function() {};
SampleContract.prototype = {
    init: function() {},
    //获取前端传入的数字，并与内部随机生成的数字进行比较
    clipIn: function() {
        //获取使用者的地址
        var from = Blockchain.transaction.from;
        //获取使用者支付的nas数值
        var value = Blockchain.transaction.value;
		console.log(value);
        //判断使用者是否支付1个NAS
        if (value.equals('1000000000000000000')) { throw new Error("必须支付0.1个NAS!");}
		return true;
    },
    withDraw: function(amount) {
        amount = parseInt(amount);
        var user = Blockchain.transaction.from;
        //判断是否是指定的账户地址
        if (user == "n1bHFzpVkNEGGfmCifAKizz33n7vhsyWNA6") {
            var withDrawResult = Blockchain.transfer(user, amount);
            if (withDrawResult == true) {
                console.log("提款成功");
                return true;
            } else {
                console.log("提款失败");
                throw new Error("提款失败");
            }
        } else {
            console.log("你没有权限");
            throw new Error("你没有权限");
        }
    }
};

module.exports = SampleContract;