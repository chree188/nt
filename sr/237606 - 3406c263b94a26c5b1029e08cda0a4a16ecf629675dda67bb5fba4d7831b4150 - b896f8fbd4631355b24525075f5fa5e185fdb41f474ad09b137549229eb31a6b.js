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
        this.rate = new BigNumber(rate);
        this.creator = Blockchain.transaction.from;
        this.description = description;
        this.balance = new BigNumber(Blockchain.transaction.value);
        return this.info()
    },
    donate: function () {
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
        return { "description": this.description, "rate": this.rate, "balance": this.balance }
    }
    ,
    takeout: function (to) {
        BigNumber.config({ ERRORS: false });
        let from = Blockchain.transaction.from;
        this.rewarded(to);
        let gas = new BigNumber(Blockchain.transaction.gasLimit) * 2;
        let value = Math.ceil(this.balance * this.rate);
        //return gas
        Blockchain.transfer(from, gas);
        Blockchain.transfer(to, value);
        this.receiverMap.set(to, true);
        this.balance = this.balance - gas - value;
    }
}

module.exports = Contract;