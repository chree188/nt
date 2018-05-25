'use strict';

//消息
var FTContract = function () {
    LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineProperty(this, "pay"); //进门价格
};

FTContract.prototype = {

    init: function () {
        this.pay = 0.01;
        this.adminAddress = "n1ZyXGb1xvf3uNiFw18bKMizfavsNxQzx2X";
    },
    //玩
    play: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value != this.pay * 1000000000000000000) {
            throw new Error("Sorry, please pay " + this.pay + " NAS only.");
        }
        this._transferAmount(this.adminAddress, this.pay);
    },
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

module.exports = FTContract;