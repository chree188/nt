"use strict";

var Deposit = function (text) {
    if (text) {
        var object = JSON.parse(text);
        this.amount = new BigNumber(object.amount);
        this.owners = object.owners;
        this.threshold = object.threshold;
        this.id = object.id;
    }
}

var LockSign = function () {
    LocalContractStorage.defineMapProperty(this, "deposits", {
        parse: function (text) {
            return new Deposit(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
}


LockSign.prototype = {

    init: function () {
    },

    deposit: function (id, owners, threshold) {
        var from = Blockchain.transaction.from;
        var amount = Blockchain.transaction.value;

        threshold = new BigNumber(threshold);

        if (this.deposits.get(id)) {
            throw new Error("Conflicting ID.");
        }

        /* validate */
        if (amount.lte(0)) {
            throw new Error("Amount is negative or zero.");
        }
        if (!Array.isArray(owners)) {
            throw new Error("Sig addresses must be array.");
        }
        if (owners.length == 0) {
            throw new Error("At least one sig address has to be specified.");
        }
        if (owners.length > 10) {
            throw new Error("Too many sig addresses specified.");
        }
        owners.forEach(function(addr) {
            if (Blockchain.verifyAddress(addr) == 0) {
                throw new Error("Invalid address.");
            }
        })
        if (threshold < 1) {
            throw new Error("At least one signature is required.");
        }
        if (threshold < 1) {
            throw new Error("At least one signature is required.");
        }
        if (threshold > owners.length) {
            throw new Error("Threshold is greater than number of sig addresses.");
        }

        var deposit = new Deposit();
        deposit.amount = amount;
        deposit.owners = owners.reduce(function(map, addr) {
            map[addr] = false;
            return map;
        }, {});
        deposit.threshold = threshold;
        deposit.from = from;
        deposit.id = id;

        this.deposits.put(id, deposit);

        return deposit;
    },

    spend: function (id, to) {
        var deposit = this.deposits.get(id);

        if (!deposit) {
            throw new Error("Deposit is not found.");
        }

        var signer = Blockchain.transaction.from;
        if (!(signer in deposit.owners)) {
            throw new Error("Not in the list of owners.");
        }
        if (Blockchain.verifyAddress(to) == 0) {
            throw new Error("Invalid address.");
        }

        deposit.owners[signer] = to;

        var n = 0;

        Object.getOwnPropertyNames(deposit.owners).forEach(function(owner) {
            var addr = deposit.owners[owner];
            if (addr == to) {
                n++;
            }
        });

        if (n >= deposit.threshold && deposit.amount.gt(0)) {
            this._transfer(to, deposit.amount);
            deposit.amount = new BigNumber(0);
        }

        this.deposits.set(id, deposit);

        return deposit;
    },

    status: function (id) {
        var deposit = this.deposits.get(id);
        if (!deposit) {
            throw new Error("Deposit is not found.");
        }
        return deposit;
    },

    _transfer: function (address, value) {
        var result = Blockchain.transfer(address, value);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value
            }
        });
    }
}

module.exports = LockSign;
