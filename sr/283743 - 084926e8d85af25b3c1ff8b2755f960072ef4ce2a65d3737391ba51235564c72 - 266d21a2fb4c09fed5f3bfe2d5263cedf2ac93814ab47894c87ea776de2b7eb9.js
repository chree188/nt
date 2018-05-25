'use strict';

var FGContract = function () {
    LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineProperty(this, "pay"); //参与用户支付金额
    LocalContractStorage.defineProperty(this, "commision"); //手续费
};

FGContract.prototype = {

    init: function () {
        this.adminAddress = "n1bzyEpqtL5hvXJq13ntRaPddYR48ZQj3V1";
        this.pay = 0.01;
        this.commision = 0.01;
    },

    join: function (finger) {
        var value = Blockchain.transaction.value;
        if (value != this.pay * 1000000000000000000) {
            throw new Error("Sorry, please bid " + this.pay + " NAS only.");
        }
        this._transferAmount(this.adminAddress, this.commision);//手续费
    },
    //交易
    _transferAmount: function (address, amount) {
        var result = Blockchain.transfer(address, amount * 1000000000000000000);
        if (!result) {
            Event.Trigger("TransferFailed", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: address,
                    value: amount
                }
            });

            throw new Error("transfer failed. Address:" + address + ", NAS:" + amount);
        }

        Event.Trigger("Transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: amount
            }
        });
    },

};

module.exports = FGContract;