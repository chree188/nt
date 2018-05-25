'use strict';

var Contract = function () {

    LocalContractStorage.defineProperty(this, "countersLength");
    LocalContractStorage.defineMapProperty(this, "index");

    LocalContractStorage.defineMapProperty(this, "counters", {
        parse: function (text) {
            return new BigNumber(text);
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
        this.owner = Blockchain.transaction.from;
        this.value = new BigNumber(0);
        this.countersLength = 0;
    },

    vote: function(str_key) {
        var count = this.counters.get(str_key);
        if (!count) {
            count = new BigNumber(0);
            this.index.set(this.countersLength, str_key);
            this.countersLength++;
        }

        this.counters.set(str_key, count.plus(Blockchain.transaction.value));
        this.value = this.value.plus(Blockchain.transaction.value);
    },

    list_counters: function() {
        var countersMap = {};

        for (var i = 0; i < this.countersLength; i++) {
            countersMap[this.index.get(i)] = this.counters.get(this.index.get(i));
        }

        return countersMap;
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