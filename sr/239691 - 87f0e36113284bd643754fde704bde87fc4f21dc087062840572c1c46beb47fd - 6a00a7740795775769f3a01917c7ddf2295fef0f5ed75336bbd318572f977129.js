'use strict';

var Contract = function () {

    LocalContractStorage.defineProperty(this, "creator", null);
    LocalContractStorage.defineProperty(this, "rate", null);
    LocalContractStorage.defineProperty(this, "description", null);
    LocalContractStorage.defineMapProperty(this, 'receiverMap');
    LocalContractStorage.defineProperty(this, 'balance', null);
}

Contract.prototype = {
    init: function (rate, description) {
        BigNumber.config({ ERRORS: false });
        this.rate = new BigNumber(rate);
        this.creator = Blockchain.transaction.from;
        this.description = description;
        this.balance = new BigNumber(Blockchain.transaction.value);
        
        return this.info()
    },
    donate: function () {
        BigNumber.config({ ERRORS: false });
        let value = new BigNumber(Blockchain.transaction.value);
        this.balance = value.plus(this.balance);
    },
    rewarded: function (to) {
        let r = Blockchain.verifyAddress(to);
        if (r == 0) {
            throw new Error("The address " + to + " is invalid")
        }
        let status = this.receiverMap.get(to);
        if (status) {
            throw new Error("The address has been rewarded");
        }
    },
    info: function () {
        BigNumber.config({ ERRORS: false });
        return { "description": this.description, "rate": this.rate, "balance": this.balance }
    }
    ,
    takeout: function (to) {
        BigNumber.config({ ERRORS: false });
        let from = Blockchain.transaction.from;
        this.rewarded(to);
        let gas = new BigNumber(Blockchain.transaction.gasLimit) * 2;
        let value = Math.ceil(this.balance * this.rate);
        this.balance = this.balance - gas - value;
        if (this.balance <= 0)
            throw new Error("Insufficient balance in contract");
        //return gas
        let result1 = Blockchain.transfer(from, gas);
        let result2 = Blockchain.transfer(to, value);
        if (!result1) {
            throw new Error("transfer 1 failed.");
        }
        if (!result2) {
            throw new Error("transfer 2 failed.");
        }
        this.receiverMap.set(to, true);

    }
}

module.exports = Contract;