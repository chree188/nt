'use strict';
var TheRaiseInfo = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = new BigNumber(o.id);
        this.remark = o.remark;
        this.title = o.title;
        this.raiseCount = new BigNumber(o.raiseCount);
        this.time = o.time;
        this.status = o.status;
        this.owin = o.owin;
        this.currentCount = new BigNumber(o.currentCount);
        this.DonationsInfos = o.DonationsInfos;

    } else {
        this.id = 0;
        this.remark = "";
        this.title = "";
        this.raiseCount = new BigNumber(0);
        this.time = "";
        this.status = 0;
        this.owin = "";
        this.currentCount = new BigNumber(0);
        this.DonationsInfos = [];
    }
};
TheRaiseInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var DonationsInfos = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.donationsAddr = o.donationsAddr;
        this.donationsCount = new BigNumber(o.donationsCount);
        this.remark = o.remark;
        this.time = o.time;

    } else {
        this.donationsCount = new BigNumber(0);
        this.donationsAddr = "";
        this.time = "";
        this.remark = "";
    }
};
DonationsInfos.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var UserDonationsInfo = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.donationsIds = o.donationsIds;
        this.donationsCount = new BigNumber(o.donationsCount);

    } else {
        this.donationsCount = new BigNumber(0);
        this.donationsIds = [];

    }
};
UserDonationsInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var RaiseContract = function () {
    LocalContractStorage.defineMapProperty(this, "TheRaiseInfos", {
        parse: function (text) {
            return new TheRaiseInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "UserDonations", {

        parse: function (text) {
            return new UserDonationsInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }

    });
    LocalContractStorage.defineMapProperty(this, "UserMapRaise");
    LocalContractStorage.defineProperty(this, "users");
    LocalContractStorage.defineProperty(this, "create");
    LocalContractStorage.defineProperty(this, "max");
    LocalContractStorage.defineProperty(this, "index");

    LocalContractStorage.defineProperty(this, "amountbalance", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }



    });

};

// save value to contract, only after height of block, users can takeout
RaiseContract.prototype = {
    init: function () {
        //TODO:
        this.create = Blockchain.transaction.from;
        this.max = 5;
        this.index = 0;
        this.users = [];
        this.amountbalance = new BigNumber(0);

    },
    GetIndex: function (from) {
        var a = this.index;
        var users = this.users;
        var vc = this.UserMapRaise.get(from);

        return " index" + a + "  users" + users + "  map" + vc
    },
    GetSelf: function () {
        var from = Blockchain.transaction.from;
        var arr = this.UserMapRaise.get(from);
        var result = [];
        if (arr != null) {
            for (var i = 0; i < arr.length; i++) {
                result.push(this.TheRaiseInfos.get(arr[i]));
            }
        }

        return result;
    },
    //获取单条众筹信息
    GetRaiseInfo: function (id) {
        return this.TheRaiseInfos.get(parseInt(id));
    },
    //获取所有众筹信息
    GetAll: function () {
        var result = [];
        var userCount = this.users.length;

        for (var i = 0; i < userCount; i++) {
            var userAdd = this.users[i];
            var arr = this.UserMapRaise.get(userAdd);
            if (arr != null) {
                for (var j = 0; j < arr.length; j++) {

                    result.push(this.TheRaiseInfos.get(arr[j]));
                }
            }
        }
        return result;
    },
    //发布众筹
    Add: function (title, remark, raiseCount) {

        var from = Blockchain.transaction.from;
        var arr = this.UserMapRaise.get(from);

        if (arr != null) {
            if (arr.length >= this.max) {
                throw new Error("每个账户最多只能添加" + this.max + "个众筹！");
            }
            arr.push(this.index);

        } else {
            arr = [this.index];

        }
        var model = new TheRaiseInfo();
        model.id = this.index;
        model.title = title;
        model.remark = remark;
        var raCount = parseFloat(raiseCount) * Math.pow(10, 18);
        model.raiseCount = new BigNumber(raCount);
        model.time = new Date();
        model.status = 0;
        model.owin = from;
        model.currentCount = new BigNumber(0);
        this.TheRaiseInfos.set(this.index, model);
        this.index += 1;
        var users = this.users;
        if (users.indexOf(from) == -1) {
            users.push(from);
            this.users = users;
        }
        this.UserMapRaise.set(from, arr);
    },
    //发起捐赠
    SendDonations: function (to, id, remark) {


        if (this.users.indexOf(to) == -1) {
            throw new Error("无法查询到此用户" + to + " 发布的众筹！请确认募捐地址是否正确");
        }
        var _id = parseInt(id);
        var model = this.TheRaiseInfos.get(_id);
        if (!model) {
            throw new Error("无法查询到此用户" + to + " 发布的众筹！请确认募捐ID是否正确");
        }
        if (model.status != 0) {
            throw new Error("此众筹已完成！您捐助的金额将退回您的账户地址，请注意查收！");
        }
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var amountCount = model.currentCount.plus(value);
        this.amountbalance = this.amountbalance.plus(value);
        //捐助已经达到并超过募捐金额的时候就标记完成，并发送对应的资金
        //var at = model.raiseCount.lessThan(amountCount);
        //throw new Error(" 众筹金额model.raiseCount：" + model.raiseCount + "  此次捐赠amountCount：" + amountCount + "  两个数字对比 model.raiseCount.lessThan(amountCount)" + at);
        if (model.raiseCount <= amountCount) {
            model.status = 1;
            model.currentCount = amountCount;

        } else {
            model.currentCount = amountCount;
        }

        var donationsInfos = new DonationsInfos();
        donationsInfos.donationsCount = value;
        donationsInfos.donationsAddr = from;
        donationsInfos.time = new Date();
        donationsInfos.remark = remark;
        model.DonationsInfos.push(donationsInfos);

        var userR = this.UserDonations.get(from);
        if (!userR) {
            userR = new UserDonationsInfo();
        }
        userR.donationsCount = userR.donationsCount.plus(value);
        if (userR.donationsIds.indexOf(_id) == -1) {
            userR.donationsIds.push(_id);
        }
        this.UserDonations.put(from, userR);
        this.TheRaiseInfos.put(_id, model);



    },
    //获取我的捐赠
    myDonations: function () {
        var from = Blockchain.transaction.from;
        var myDonations = this.UserDonations.get(from);
        if (!myDonations) {
            return { amountCount: 0, list: [] };
        }
        var result = {};
        var list = [];
        var length = myDonations.donationsIds.length;
        for (var i = 0; i < length; i++) {
            var raise = this.TheRaiseInfos.get(myDonations.donationsIds[i]);
            if (raise != null) {
                var l = raise.DonationsInfos.length;
                for (var j = 0; j < l; j++) {
                    var Donations = raise.DonationsInfos[j];

                    if (Donations != null && Donations.donationsAddr === from.toString()) {
                        var model = {
                            to: raise.owin,
                            title: raise.title,
                            time: Donations.time,
                            amount: Donations.donationsCount,
                            remark: Donations.remark
                        };
                        list.push(model);
                    }
                }
            }
        }
        result = { amountCount: myDonations.donationsCount, list: list };
        return result;

    },
    //募捐人收款
    takeout: function (id) {
        var from = Blockchain.transaction.from;
        var _id = parseInt(id);
        var model = this.TheRaiseInfos.get(_id);

        if (!model) {
            throw new Error("无法查询到对应的众筹记录，请确认募捐ID是否正确！");
        }
        if (model.owin != from) {
            throw new Error("此众筹不属于您，您不能收款！");
        }
        if (model.currentCount.gt(this.amountbalance)) {
            throw new Error("合约余额不足请联系管理员！");
        }

        var result = Blockchain.transfer(from, model.currentCount);
        if (!result) {
            throw new Error("转账失败，请联系管理员！");

        }
        this.amountbalance = this.amountbalance.sub(model.currentCount);
        model.status = 2;
        this.TheRaiseInfos.put(_id, model);

        Event.Trigger("TheRaiseInfos", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: model.currentCount.toString()
            }
        });

    },
    back:function(){
        var from = Blockchain.transaction.from;
        if(this.create==from)
        {
            Blockchain.transfer(from, this.amountbalance);
            this.amountbalance=new BigNumber(0);
            Event.Trigger("TheRaiseInfos", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: from,
                    value: this.amountbalance
                }
            });
        }
      
    },
    balanceOf: function () {
        return this.amountbalance;
    },
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};
module.exports = RaiseContract;