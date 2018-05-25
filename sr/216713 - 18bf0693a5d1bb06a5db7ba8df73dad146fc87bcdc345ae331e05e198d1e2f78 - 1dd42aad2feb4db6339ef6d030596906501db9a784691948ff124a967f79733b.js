'use strict';

var Bidder = function (jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.phoneNo = obj.phoneNo;
        this.nickName = obj.nickName;
    } else {
        this.address = "";
        this.phoneNo = ""
        this.nickName = "";
    }
};

Bidder.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BidToWinContract = function () {
    LocalContractStorage.defineProperty(this, "bidNumber");
    LocalContractStorage.defineMapProperty(this, "bidPool", {
        parse: function (jsonText) {
            return new Bidder(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

BidToWinContract.prototype = {

    init: function () {
        this.bidNumber = 0;
    },

    bid: function (phoneNo, nickName) {

        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        if (this.isAddressExists(from)) {
            throw new Error("Sorry, you can't bid twice in same period.");
        }

        if (value != 1000000000000000000) {
            throw new Error("Sorry, please bid 1 NAS only.");
        }

        var bidder = new Bidder();
        bidder.address = from;
        bidder.phoneNo = phoneNo;
        bidder.nickName = nickName;

        this.bidPool.put(this.bidNumber, bidder);
        this.bidNumber++;

        if (this.bidNumber >= 100) {

            var rnd = this.random();
            var winner = this.bidPool.get(rnd);

            var result = Blockchain.transfer(winner.address, 90 * 1000000000000000000);
            if (!result) {
                throw new Error("Award transfer failed.");
            }

            Event.Trigger("BidToWin", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: winner.address,
                    value: 90
                }
            });

            result = Blockchain.transfer("n1GM4315J95rjZwB9gGfzZC47HRF6a3bfF2", 10 * 1000000000000000000);
            if (!result) {
                throw new Error("Commission transfer failed.");
            }

            Event.Trigger("BidToWin", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: "n1GM4315J95rjZwB9gGfzZC47HRF6a3bfF2",
                    value: 10
                }
            });

            this.resetBidPool();
        }
    },

    resetBidPool: function() {
        for (var i = 0; i < this.bidNumber; i++) {
            this.bidPool.del(i)
        }

        this.bidNumber = 0;
    },
    
    isAddressExists: function (address) {
        for (var i = 0; i < this.bidNumber; i++) {
            if (this.bidPool.get(i).address == address)
                return true;
        }

        return false;
    },

    random : function () {
        var sum = 0;
        var txHash = Blockchain.transaction.hash;

        for (var i = 0; i < txHash.length; i++) {
            sum += txHash.charCodeAt(i);
        }

        return parseInt(sum.toString().slice(-2), 10);
    },

    getProgress: function () {
        return this.bidNumber;
    },

    getBidders: function () {
        var result = "";
        for (var i = 0; i < this.bidNumber; i++) {
            var object = this.bidPool.get(i);
            result += object + " ";
        }

        return result;
    },
};

module.exports = BidToWinContract;
