'use strict';
var HelpInfo = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = new BigNumber(o.id);
        this.content = o.content;
        this.title = o.title;
        this.awardMoney = new BigNumber(o.awardMoney);
        this.time = o.time;
        this.status = o.status;
        this.owin = o.owin;
        this.ParticipationInfos = o.ParticipationInfos;


    } else {
        this.id = 0;
        this.content = "";
        this.title = "";
        this.awardMoney = new BigNumber(0);
        this.time = "";
        this.status = 0;
        this.owin = "";
        this.ParticipationInfos = [];
    }
};
HelpInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var ParticipationInfo = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.addr = o.addr;
        this.content = o.content;
        this.time = o.time;
        this.status = o.status;

    } else {
        this.addr = "";
        this.time = "";
        this.content = "";
        this.status = 0;
    }
};
ParticipationInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var UserParticipationInfo = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.ids = o.ids;
    } else {
        this.donationsCount = new BigNumber(0);
        this.ids = [];
    }
};
UserParticipationInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var HelpContract = function() {
    LocalContractStorage.defineMapProperty(this, "HelpInfos", {
        parse: function(text) {
            return new HelpInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "UserParticipations", {

        parse: function(text) {
            return new UserParticipationInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }

    });
    LocalContractStorage.defineMapProperty(this, "HelpMap");
    LocalContractStorage.defineProperty(this, "users");
    LocalContractStorage.defineProperty(this, "create");
    LocalContractStorage.defineProperty(this, "max");
    LocalContractStorage.defineProperty(this, "index");

    LocalContractStorage.defineProperty(this, "balance", {
        parse: function(text) {
            return new BigNumber(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

};

HelpContract.prototype = {
    init: function() {
        this.create = Blockchain.transaction.from;
        this.max = 10;
        this.index = 0;
        this.users = [];
        this.balance = new BigNumber(0);

    },
    myHelp: function() {
        var from = Blockchain.transaction.from;
        var arr = this.HelpMap.get(from);
        var result = [];
        if (arr != null) {
            for (var i = 0; i < arr.length; i++) {
                result.push(this.HelpInfos.get(arr[i]));
            }
        }
        return result;
    },
    allHelp: function() {
        var result = [];
        var userCount = this.users.length;

        for (var i = 0; i < userCount; i++) {
            var userAdd = this.users[i];
            var arr = this.HelpMap.get(userAdd);
            if (arr != null) {
                for (var j = 0; j < arr.length; j++) {

                    result.push(this.HelpInfos.get(arr[j]));
                }
            }
        }
        return result;
    },
    getindex: function() {
        return this.index;
    },

    publish: function(title, content) {

        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var arr = this.HelpMap.get(from);

        if (arr != null) {
            if (arr.length >= this.max) {
                throw new Error("账户最多只能发布" + this.max + "个消息！");
            }
            arr.push(this.index);

        } else {
            arr = [this.index];

        }
        var help = new HelpInfo();
        help.id = 0;
        help.content = content;
        help.title = title;

        help.awardMoney = new BigNumber(value);
        help.time = new Date();
        help.status = 0;
        help.owin = from;
        this.HelpInfos.set(this.index, help);
        this.index += 1;
        var users = this.users;
        if (users.indexOf(from) == -1) {
            users.push(from);
            this.users = users;
        }
        this.balance = this.balance.plus(new BigNumber(value));
        this.HelpMap.set(from, arr);
    },
    myprovides: function() {
        var from = Blockchain.transaction.from;
        var model = this.UserParticipations.get(from);
        if (!model) {
            return [];
        }

        var list = [];
        var length = model.ids.length;
        for (var i = 0; i < length; i++) {
            var help = this.HelpInfos.get(model.ids[i]);
            if (help != null) {
                var l = help.ParticipationInfos.length;
                for (var j = 0; j < l; j++) {
                    var participation = help.ParticipationInfos[j];
                    if (participation != null) {
                        var item = {
                            to: help.owin,
                            title: help.title,
                            time: participation.time,
                            status: participation.status,
                            content: participation.content
                        };
                        list.push(item);
                    }
                }
            }
        }

        return list;

    },
    provideInformation: function(id, content) {

        var _id = parseInt(id);
        var help = this.HelpInfos.get(_id);
        if (!help) {
            throw new Error("无法查询到此用户" + help.owin + " 发布的信息！");
        }
        if (help.status != 0) {
            throw new Error("此信息已经完成！");
        }
        var from = Blockchain.transaction.from;



        var participationInfo = new ParticipationInfo();
        participationInfo.status = 0;
        participationInfo.addr = from;
        participationInfo.time = new Date();
        participationInfo.content = content;
        help.ParticipationInfos.push(participationInfo);

        var userR = this.UserParticipations.get(from);
        if (!userR) {
            userR = new UserParticipationInfo();
        }

        if (userR.ids.indexOf(_id) == -1) {
            userR.ids.push(_id);
        }
        this.UserParticipations.put(from, userR);
        this.HelpInfos.put(_id, help);



    },
    payment: function(id, to) {
        var from = Blockchain.transaction.from;
        var _id = parseInt(id);
        var help = this.HelpInfos.get(_id);

        if (!help) {
            throw new Error("无法查询到对应的消息记录！");
        }
        if (help.owin != from) {
            throw new Error("您没有权限付款！");
        }
        var arr = help.ParticipationInfos;
        var index = -1;
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item.addr == to) {
                index = i;
                break;
            }

        }
        if (index < 0) {
            throw new Error("这个人没有提供帮助，无法支付！");
        }


        var result = Blockchain.transfer(to, help.awardMoney);
        if (!result) {
            throw new Error("转账失败，请联系管理员！");

        }
        var p = arr[index];
        p.status = 1;
        arr[index] = p;
        help.ParticipationInfos = arr;

        this.balance = this.balance.sub(help.awardMoney);
        help.status = 1;
        this.HelpInfos.put(_id, help);

        Event.Trigger("HelpInfos", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: help.awardMoney,
                value: help.awardMoney.toString()
            }
        });

    },
    balanceOf: function() {
        return this.balance;
    },
    verifyAddress: function(address) {
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};
module.exports = HelpContract;