'use strict';

//用户
var User = function (jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.finger = obj.finger;//0 石头 1剪刀 2 布
    } else {
        this.address = "";
        this.finger = ""
    }
};

User.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var FGContract = function () {
    LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineProperty(this, "userCount"); //当前人数
    LocalContractStorage.defineProperty(this, "commision"); //手续费
    LocalContractStorage.defineProperty(this, "pay"); //参与用户支付金额
    LocalContractStorage.defineMapProperty(this, "users", { //当前参与用户 两两对决 
        parse: function (jsonText) {
            return new User(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "winners", { //赢家
        parse: function (jsonText) {
            return new User(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

FGContract.prototype = {

    init: function () {
        this.adminAddress = "n1ZyXGb1xvf3uNiFw18bKMizfavsNxQzx2X";
        this.userCount = 0;
        this.pay = 0.5;
        this.commision = 0.01;
    },

    join: function (finger) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;



        if (value != this.pay * 1000000000000000000) {
            throw new Error("Sorry, please bid " + this.pay + " NAS only.");
        }
        if (this.userCount == 2) {
            throw new Error("Wait for the current player to complete the match.");//当前玩家还没有完成 
        }
        if (finger < 0 || finger > 3) {
            throw new Error("Finger error.");//手指错误
        }
        var user = new User();
        user.address = from;
        user.finger = finger;

        this.users.put(this.userCount, user);
        this.userCount++;

        if (this.userCount == 2) {
            var user1 = this.users.get(0);
            var user2 = this.users.get(1);
            var winnerindex = this._getResult(user.finger, user2.finger);//-1两人平分

            var awardAmount = this.pay * 2 - this.commision;
            if (winnerindex == -1) {
                this._transferAmount(user1.address, awardAmount / 2.0);
                this._transferAmount(user2.address, awardAmount / 2.0);
            } else {
                var winner = this.users.get(winnerindex);
                this._transferAmount(winner.address, awardAmount);
            }


            this._transferAmount(this.adminAddress, this.commision);//手续费

            this.winners.put(winner);

            this._resetUsers();
        }
    },

    //重置奖池
    _resetUsers: function () {
        for (var i = 0; i < this.userCount; i++) {
            this.users.del(i)
        }

        this.userCount = 0;
    },
    //交易
    _transferAmount: function (address, amount) {
        var result = Blockchain.transfer(address, amount * 1000000000000000000);
        if (!result) {
            Event.Trigger("TransferFailed", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: address,
                    value: amount
                }
            });

            throw new Error("transfer failed. Address:" + address + ", NAS:" + amount);
        }

        Event.Trigger("Transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: amount
            }
        });
    },
    //获得结果
    _getResult: function (f1, f2) {
        if (f1 == f2) {
            return -1;
        }
        if (f1 == 0 && f2 == 2) {
            return 0;
        }
        if (f1 == 2 && f2 == 0) {
            return 1;
        }
        return f1 < f2 ? 1 : 0;
    },
    isAddressExists: function (address) {
        for (var i = 0; i < this.bidNumber; i++) {
            if (this.users.get(i).address == address)
                return true;
        }

        return false;
    },
};

module.exports = FGContract;