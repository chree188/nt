'use strict';

//抽奖参与者 数据结构
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
    LocalContractStorage.defineProperty(this, "commision");                //手续费
    LocalContractStorage.defineProperty(this, "maxBidCount");              //最大抽奖人数（满N人就开奖）
    LocalContractStorage.defineProperty(this, "nasPerBid");                //每人支付多少NAS
    LocalContractStorage.defineProperty(this, "currentPeriod");            //当前期数
    LocalContractStorage.defineProperty(this, "bidNumber");                //当前人数（进度）
    LocalContractStorage.defineProperty(this, "lastWinnerBidNumber");      //上一个中奖序号
    LocalContractStorage.defineProperty(this, "adminAddress");             //管理员账户地址
    LocalContractStorage.defineProperty(this, "commisionAddress");         //手续费收款地址
    LocalContractStorage.defineMapProperty(this, "bidPool", {              //奖池
        parse: function (jsonText) {
            return new Bidder(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "historyWinners", {        //历届中奖信息
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
        this.currentPeriod = 1;
        this.maxBidCount = 10;
        this.nasPerBid = 1;
        this.commision = 1;
        this.adminAddress = "n1H1w4D3vNXRRafhJiRt52ens6SW5ZHnwrd";
        this.commisionAddress = "n1H1w4D3vNXRRafhJiRt52ens6SW5ZHnwrd";
    },

    bid: function (phoneNo, nickName) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        if (this.isAddressExists(from)) {
            throw new Error("Sorry, you can't bid twice in a same period.");//每人每期只能投一次
        }

        if (value != this.nasPerBid * 1000000000000000000) {
            throw new Error("Sorry, please bid " + this.nasPerBid +" NAS only.");
        }

        var bidder = new Bidder();
        bidder.address = from;
        bidder.phoneNo = phoneNo;
        bidder.nickName = nickName;

        this.bidPool.put(this.bidNumber, bidder);
        this.bidNumber++;

        if (this.bidNumber >= this.maxBidCount) {
            var rnd = this.random();
            var winner = this.bidPool.get(rnd);

            var awardAmount = this.nasPerBid * this.maxBidCount - this.commision;
            var result = Blockchain.transfer(winner.address, awardAmount * 1000000000000000000);//奖池金额-手续费 转入中奖者账户
            if (!result) {
                Event.Trigger("BidToWinAwardTransferFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: winner.address,
                        value: awardAmount
                    }
                });

                throw new Error("Award transfer failed. Winner Address:" + winner.address + ", NAS:" + awardAmount);
            }

            Event.Trigger("BidToWinAwardTransfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: winner.address,
                    value: awardAmount
                }
            });

            result = Blockchain.transfer(this.commisionAddress, this.commision * 1000000000000000000);//手续费转到指定账户
            if (!result) {

                Event.Trigger("BidToWinCommissionTransferFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: this.commisionAddress,
                        value: this.commision
                    }
                });

                throw new Error("Commission transfer failed. Address:" + this.commisionAddress + ", NAS:" + this.commision);
            }

            Event.Trigger("BidToWinCommissionTransfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.commisionAddress,
                    value: this.commision
                }
            });

            this.lastWinnerBidNumber = rnd;
            this.historyWinners.put(this.currentPeriod, winner);
            this.currentPeriod++;

            this._resetBidPool();
        }
    },

    //重置奖池
    _resetBidPool: function() {
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

        var rnd = parseInt(sum.toString().slice(-1), 10);//取tx has的h每个字母ASCII码，加和，取最后一位数字作为随机的中奖码(0-9)

        return rnd;
    },

    //当前进度（前端读取后公示）
    getProgress: function () {
        return this.bidNumber;
    },

    //当前参与者信息（前端读取后公示）
    getBidders: function () {
        var result = "";
        for (var i = 0; i < this.bidNumber; i++) {
            var object = this.bidPool.get(i);
            result += object + "\r\n";
        }

        return result;
    },

    //当前期数
    getPeriod: function () {
        return this.currentPeriod;
    },

    //上次中奖码（前端读取后公示）
    getLastWinnerBidNumber: function () {
        return this.lastWinnerBidNumber;
    },

    //历届中奖信息（前端读取后公示）
    getHistoryWinners: function () {
        var result = "";
        for (var i = 1; i < this.currentPeriod; i++) {
            var object = this.historyWinners.get(i);
            result += object + "\r\n";
        }

        return result;
    },

    //退款
    refund: function () {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        for (var i = 0; i < this.bidNumber; i++) {
            var bidder = this.bidPool.get(i);
            var result = Blockchain.transfer(bidder.address, this.nasPerBid * 1000000000000000000);
            if (!result) {
                Event.Trigger("BidToWinRefundFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: bidder.address,
                        value: this.nasPerBid
                    }
                });

                throw new Error("Refund failed. Address:" + bidder.address + ", Nas:" + this.nasPerBid);
            }

            Event.Trigger("BidToWinRefund", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: bidder.address,
                    value: this.nasPerBid
                }
            });
        }

        this._resetBidPool();
    },

    //提现
    withdraw: function (value) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        if (this.bidNumber != 0) {
            throw new Error("You should refund NAS to bidders first.");//如果当前奖池有余额，必须先退款，防止将参与者的资金转走。
        }

        var result = Blockchain.transfer(this.commisionAddress, parseInt(value) * 1000000000000000000);
        if (!result) {

            Event.Trigger("BidToWinWithdrawFailed", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.commisionAddress,
                    value: value
                }
            });

            throw new Error("Withdraw failed. Address:" + this.commisionAddress + ", NAS:" + value);
        }

        Event.Trigger("BidToWinWithdraw", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: this.commisionAddress,
                value: value
            }
        });
    },

    //合约部署后，可对开奖参数进行调整。（每人支付多少NAS，每期最大人数，手续费调整）
    config: function(nasPerbid, maxBidCount, commision) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        if (this.bidNumber != 0) {
            throw new Error("You should refund NAS to bidders first.");
        }

        this.nasPerBid = parseInt(nasPerbid);
        this.maxBidCount = parseInt(maxBidCount);
        this.commision = parseInt(commision);
    },

    //合约部署后，调整手续费收款地址。
    setCommisionAddress: function (newAddress) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        this.commisionAddress = newAddress;
    },
};

module.exports = BidToWinContract;
