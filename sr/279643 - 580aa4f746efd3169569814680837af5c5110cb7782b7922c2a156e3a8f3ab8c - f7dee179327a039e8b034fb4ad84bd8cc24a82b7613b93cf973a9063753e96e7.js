"use strict";

var User = function (jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.joinItemIdxs = obj.joinItemIdxs;
    } else {
        this.address = "";
        this.joinItemIdxs = [];
    }
};
User.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var JoinItem = function (jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.idx = obj.idx;
        this.address = obj.address;
    } else {
        this.idx = 0;
        this.address = "";
    }
};
JoinItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var NasHelpers = function () {
    LocalContractStorage.defineProperty(this, "totalJoin"); // 总共参加人次
    LocalContractStorage.defineProperty(this, "currentReward"); // 当前奖励序列
    LocalContractStorage.defineProperty(this, "balance"); // 当前余额
    LocalContractStorage.defineProperty(this, "commision"); // 手续费
    LocalContractStorage.defineProperty(this, "nasPerBid"); // 每人支付多少NAS
    LocalContractStorage.defineProperty(this, "nasReward"); // 奖金
    LocalContractStorage.defineProperty(this, "nasRewardLine"); // 账号余额达到多少，则派奖
    LocalContractStorage.defineProperty(this, "adminAddress"); // 管理员账户地址
    LocalContractStorage.defineProperty(this, "commisionAddress"); // 手续费收款地址
    LocalContractStorage.defineMapProperty(this, "joinItems", { // 参加队列
        parse: function(jsonText) {
            return new JoinItem(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "users", { // 参加用户
        parse: function(jsonText) {
            return new User(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

NasHelpers.prototype = {
    init: function () {
        this.totalJoin = -1;
        this.currentReward = -1;
        this.balance = 0;
        this.commision = 0.02;
        this.nasPerBid = 1;
        this.nasReward = 2;
        this.nasRewardLine = 5;
        this.adminAddress = "n1NVoqbUhTzBVxGLANqmXSUmMfZntif5jtz";
        this.commisionAddress = "n1NVoqbUhTzBVxGLANqmXSUmMfZntif5jtz";
    },

    join: function () { // 参加活动
        var from = Blockchain.transaction.from;
        var value = new BigNumber(Blockchain.transaction.value).div(1000000000000000000);
        var valueBegin = new BigNumber(Blockchain.transaction.value).div(1000000000000000000);

        var totalCommision = new BigNumber(0);

        var user = this.users.get(from);
        if (!user) {
            user = new User();
        }
        user.address = from;
        while (true) {
            value = value.minus(this.nasPerBid); // 扣去参加的费用
            if (value.gte(0)) { // 转账足够，参加活动成功
                totalCommision = totalCommision.plus(this.commision);

                this.totalJoin = this.totalJoin + 1;
                var joinItem = new JoinItem();
                joinItem.address = from;
                joinItem.idx = this.totalJoin;
                this.joinItems.put(joinItem.idx, joinItem);

                user.joinItemIdxs.push(joinItem.idx);
            } else {
                break;
            }
        }
        this.users.put(from, user);
        if (totalCommision.lte(0)) {
            throw new Error("Join failed. Address:" + this.from + ", NAS:" + value);
        }


        // 余额调整
        var nowBalance = new BigNumber(this.balance);
        nowBalance = nowBalance.plus(valueBegin).minus(totalCommision); // 余额等于转入的钱，减去手续费
        this.balance = nowBalance;

        // 转出手续费
        var result = Blockchain.transfer(this.commisionAddress, totalCommision.times(1000000000000000000));
        if (!result) {
            throw new Error("Withdraw failed. Address:" + this.commisionAddress + ", NAS:" + totalCommision.times(1000000000000000000));
        }

        while (true) {
            if (nowBalance.gte(this.nasRewardLine) && nowBalance.gt(this.nasReward)) { // 大于开奖线和派奖金额，派奖
                nowBalance = nowBalance.minus(this.nasReward);
                this.balance = nowBalance;
                this.currentReward = this.currentReward + 1;
                var joinItem = this.joinItems.get(this.currentReward);
                if (joinItem) {
                    var result = Blockchain.transfer(joinItem.address, new BigNumber(this.nasReward).times(1000000000000000000));
                    if (!result) {
                        // 手动回滚
                        nowBalance = nowBalance.plus(this.nasReward);
                        this.balance = nowBalance;
                        this.currentReward = this.currentReward - 1;
                        throw new Error("Reward failed. Address:" + joinItem.address + ", NAS:" + this.nasReward);
                    }
                } else {
                    throw new Error("Can not find joinItem " + this.currentReward + " !");
                }
            } else {
                break;
            }
        }
    },
    infos: function () { // 活动信息
        var from = Blockchain.transaction.from;
        var user = this.users.get(from);
        if (!user) {
            user = new User();
            user.address = from;
        }
        return {
            "totalJoin": this.totalJoin,
            "currentReward": this.currentReward,
            "balance": this.balance,
            "commision": this.commision,
            "nasPerBid": this.nasPerBid,
            "nasReward": this.nasReward,
            "nasRewardLine": this.nasRewardLine,
            "myInfo": user
        };
    },
    lastRewards: function () { // 刚刚中奖的用户
        var addresses = [];
        var idx = this.currentReward;
        for (var i=0; i<10 && idx>=0; i++) {
            var item = this.joinItems.get(idx);
            if (item && item.address) {
                addresses.push(item.address);
            }
            idx--;
        }
        return addresses;
    },

    setConf: function (commision, nasPerBid, nasReward, nasRewardLine) {
        if (!this._checkAdminAddress()) {
            throw new Error("Permission denied.");
        }
        this.commision = commision;
        this.nasPerBid = nasPerBid;
        this.nasReward = nasReward;
        this.nasRewardLine = nasRewardLine;
    },
    // setCommision: function (value) { // 修改手续费
    //     if (!this._checkAdminAddress()) {
    //         throw new Error("Permission denied.");
    //     }
    //     this.commision = value;
    // },
    // setNasPerBid: function (value) { // 修改参加活动的Nas数量
    //     if (!this._checkAdminAddress()) {
    //         throw new Error("Permission denied.");
    //     }
    //     this.nasPerBid = value;
    // },
    setAdminAddress: function (value) { // 修改管理员地址
        if (!this._checkAdminAddress()) {
            throw new Error("Permission denied.");
        }
        this.adminAddress = value;
    },
    setCommisionAddress: function (value) { // 修改手续费地址
        if (!this._checkAdminAddress()) {
            throw new Error("Permission denied.");
        }
        this.commisionAddress = value;
    },
    _checkAdminAddress: function () { // 检查是否管理员的地址
        var from = Blockchain.transaction.from;
        if (from == this.adminAddress) {
            return true;
        } else {
            return false;
        }
        this.commision = value;
    },
    //提现
    withdraw: function(value) {
        if (!this._checkAdminAddress()) {
            throw new Error("Permission denied.");
        }

        var result = Blockchain.transfer(this.commisionAddress, new BigNumber(value).times(1000000000000000000));
        if (!result) {
            throw new Error("Withdraw failed. Address:" + this.commisionAddress + ", NAS:" + value);
        }
    }
};

module.exports = NasHelpers;