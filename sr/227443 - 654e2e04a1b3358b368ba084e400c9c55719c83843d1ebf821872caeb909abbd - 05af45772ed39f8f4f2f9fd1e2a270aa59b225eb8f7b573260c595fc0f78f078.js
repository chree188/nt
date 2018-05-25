'use strict';

var GossipContract = function () {
    LocalContractStorage.defineMapProperty(this, "userRefCount", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    LocalContractStorage.defineProperty(this, "depositAmount", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });
};

GossipContract.prototype = {
    init: function () {
        this.depositAmount = new BigNumber("1e18");
    },

    deposit: function (referee) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        if (referee == from) {
            throw new Error("You can not refer yourself!");
        }

        if (this.isDeposit(from)) {
            throw new Error("Already deposit!");
        }

        if (!value.eq(this.depositAmount)) {
            throw new Error("Deposit amount error!");
        }

        if (referee && this.isDeposit(referee)) {
            var count = this.userRefCount.get(referee);
            count = count.plus(1);
            this.userRefCount.put(referee, count);

            var result = Blockchain.transfer(referee, this.depositAmount);
            if (!result) {
                throw new Error("Transfer failed!");
            }
        }

        this.userRefCount.put(from, 0);

    },

    isDeposit: function (address) {
        if (this.userRefCount.get(address))
            return true;
        else
            return false;
    },

    getRefCount: function (address) {
        if (!this.isDeposit(address))
            return 0;
        else
            return this.userRefCount.get(address);
    },

    getDepositAmount: function () {
        return this.depositAmount;
    }

 };


module.exports = GossipContract;