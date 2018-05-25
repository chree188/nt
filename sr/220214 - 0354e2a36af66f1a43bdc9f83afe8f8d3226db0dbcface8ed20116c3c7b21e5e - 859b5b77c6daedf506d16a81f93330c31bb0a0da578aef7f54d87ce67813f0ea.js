'use strict';

var Contract = function () {
    LocalContractStorage.defineProperty(this, "limit", null);
    LocalContractStorage.defineProperty(this, "creator", null);
    LocalContractStorage.defineProperty(this, "leaderboard", null);
};

Object.prototype.getKeyByValue = function (value) {
    for (var prop in this) {
        if (this.hasOwnProperty(prop)) {
            if (this[prop] == value)
                return prop;
        }
    } 
}

// save value to contract, only after height of block, users can takeout
Contract.prototype = {
    init: function (limit) {
        this.limit = new BigNumber(limit);
        this.creator = Blockchain.transaction.from;
        this.leaderboard = {};
        // this.vote("power by henry");
        return this.info();
    },
    vote: function (title) {
        var amount = new BigNumber(Blockchain.transaction.value);
        let leaderboard = this.leaderboard;
        if (!leaderboard[title] && Object.keys(leaderboard).length >= this.limit) {
            let minFee = this.minvotefee();
            let minTitle = leaderboard.getKeyByValue(minFee);
            if (amount > minFee) {
                this._del(minTitle);
                this._append(title, amount);
            } else {
                throw new Error("Voting failed,Must be greater than the minimum voting cost.");
            }
        } else {
            this._append(title, amount);
        }
    },
    _append: function (title, amount) {
        let leaderboard = this.leaderboard;
        let fee = leaderboard[title];
        if (fee) {
            amount += fee;
        }
        leaderboard[title] = amount;
        this.leaderboard = leaderboard;
    },
    _del: function (title) {
        let leaderboard = this.leaderboard;
        delete leaderboard[title]
        this.leaderboard = leaderboard;
    },
    _refund: function () {
        var from = Blockchain.transaction.from;
        var amount = new BigNumber(Blockchain.transaction.value);
        var result = Blockchain.transfer(from, amount);
        if (!result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount.toString()
            }
        });
    },
    info: function () {
        return this.leaderboard;
    },
    minvotefee: function () {
        let leaderboard = this.leaderboard;
        let arr = Object.values(leaderboard);
        let minFee = Math.min(...arr);
        return minFee;
    }
    ,
    takeout: function (amount) {
        var from = Blockchain.transaction.from;
        let value = new BigNumber(amount);
        if (from == this.creator) {
            var result = Blockchain.transfer(from, value);
            if (!result) {
                throw new Error("transfer failed.");
            }
            Event.Trigger("BankVault", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: from,
                    value: value.toString()
                }
            });
        }
    }
};
module.exports = Contract;