"use strict";

var FormatItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.balance = new BigNumber(obj.balance);
        this.expiryHeight = new BigNumber(obj.expiryHeight);
    } else {
        this.balance = new BigNumber(0);
        this.expiryHeight = new BigNumber(0);
    }
};

FormatItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var testContract = function () {
    //用户存储
    LocalContractStorage.defineMapProperty(this, "userSave", {
        parse: function (text) {
            return new FormatItem(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
    //中奖结果
    LocalContractStorage.defineMapProperty(this, "luckyNumber", {
    });
    //中奖纪录
    LocalContractStorage.defineMapProperty(this, "luckySave", {
    });
};

testContract.prototype = {
    init: function () {
        //
    },

    save: function (height) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        //console.log(from);
        //console.log(value);
        //var value = 100;
        if (value != "10000000000000000") {
            return false;
        }
        var bk_height = new BigNumber(Blockchain.block.height);

        var orig_deposit = this.userSave.get(from);
        if (orig_deposit) {
            value = value.plus(orig_deposit.balance);
        }

        var deposit = new FormatItem();
        deposit.balance = value;
        deposit.expiryHeight = bk_height.plus(height);
        //console.log("deposit:"+deposit);

        //生成随机数
        var arr =[1,2,3,4,5,6,7,8,9];
        var rand1 = parseInt(Math.random()*arr.length);
        var rand2 = parseInt(Math.random()*arr.length);
        var rand3 = parseInt(Math.random()*arr.length);
        var returnRand = [rand1, rand2, rand3];
        this.luckyNumber.set(from, returnRand);//保存中奖数字

        //保存中奖纪录
        var rankSave = 0;
        if (rand1 == rand2 || rand1 == rand3 || rand2 == rand3) {
            var rankSave = 1;
            this.luckySave.set(from, rankSave);
        }
        if (rand1 == rand2 && rand2 == rand3) {
            var rankSave = 2;
            this.luckySave.set(from, rankSave);
        }
        this.userSave.set(from, deposit);

        //return returnRand;
    },

    transfer: function (address, value) {
        //console.log(Blockchain);
        var mainAd = "n1KTs13eKtSKZk2LXZ48MtEF6FsPWxQnEKt";
        var from = Blockchain.transaction.from;
        if (from == mainAd) {
            var result = Blockchain.transfer(address, value);
            //console.log(result);
            Event.Trigger("transfer",{
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: address,
                    value: value
                }
            });
            return true;
        } else {
            var luckyRank = this.luckySave.get(from);
            if (!luckyRank) {
                return false;
            }
            var bkvalue = 10000000000000000*luckyRank;
            //console.log(luckyRank);
            //console.log(bkvalue);
            var bkresult = Blockchain.transfer(from, bkvalue);

            Event.Trigger("transfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: from,
                    value: bkvalue
                }
            });
            this.luckySave.del(from);
            return true;
        }
    },

    randomNumber: function() {
        var from = Blockchain.transaction.from;
        //console.log(from);
        var checkNumber = this.luckyNumber.get(from);
        //console.log(checkNumber);
        if (!checkNumber) {
            var ReNum = [[3,5,4],[2,8,4],[3,8,5],[2,9,8],[1,6,8],[8,4,6],[9,2,4],[6,3,7],[4,1,3]];
            var ReArr =[1,2,3,4,5,6,7,8,9];
            var ReRand = parseInt(Math.random()*ReArr.length);
            //var returnNum = "ReNum"+ReRand;
            return ReNum[ReRand];
        }
        this.luckyNumber.del(from);//删除得奖数字
        return checkNumber;
    },

    game: function () {
        var from = Blockchain.transaction.from;
        var arr =[1,2,3,4,5,6,7,8,9];
        var rand1 = parseInt(Math.random()*arr.length);
        var rand2 = parseInt(Math.random()*arr.length);
        var rand3 = parseInt(Math.random()*arr.length);
        var returnRand = [rand1, rand2, rand3];

        if (rand1 == rand2 || rand1 == rand3 || rand2 == rand3) {
            this.luckySave.set(from, "1");
        }
        if (rand1 == rand2 && rand2 == rand3) {
            this.luckySave.set(from, "2");
        }

        return returnRand;

    },

    verifyAddress: function (address) {
        var result = Blockchain.verifyAddress(address);
        console.log("verifyAddress result:", result);
        return result;
    }
};
module.exports = testContract;