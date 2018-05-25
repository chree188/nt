'use strict';

var Contract = function () {
    LocalContractStorage.defineProperty(this, "currentData");

    LocalContractStorage.defineProperty(this, "currentBid", {
        parse: function (text) {
            return new BigNumber(text)
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });

    LocalContractStorage.defineProperty(this, "owner");

    LocalContractStorage.defineProperty(this, "value", {
        parse: function (text) {
            return new BigNumber(text)
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

Contract.prototype = {

    init: function () {
        this.currentData = "Welcome";
        this.currentBid = new BigNumber(0);
        this.owner = Blockchain.transaction.from;
        this.value = new BigNumber(0);
    },

    current: function () {
        return {
            "current_bid": this.currentBid,
            "current_data": this.currentData
        };
    },

    bid: function (str_new_data) {
        this.value = this.value.plus(Blockchain.transaction.value);

        if (Blockchain.transaction.value.gt(this.currentBid)) {
            this.currentData = str_new_data;
            this.currentBid = Blockchain.transaction.value;
            return true;
        } else {
            return false;
        }
    },

    current_value: function () {
        return this.value;
    },

    withdraw: function () {
        if (this.owner === Blockchain.transaction.from) {
            var result = Blockchain.transfer(this.owner, this.value);
            if (result) {
                this.value = new BigNumber(0);
            } else {
                throw new Error("withdraw: Transfer Failed");
            }
        } else {
            throw new Error("withdraw: Invalid Owner");
        }
    }
}

module.exports = Contract;