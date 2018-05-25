'use strict';

//消息
var Msg = function (jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.title = obj.title;
        this.msg = obj.msg;
        this.amount = obj.amount;
        this.id = obj.id;
    } else {
        this.address = "";
        this.title = "";
        this.msg = "";
        this.amount = 0;
        this.id = 0;
    }
};

Msg.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var MSGContract = function () {
    LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineProperty(this, "msgCount"); //消息计数器
    LocalContractStorage.defineProperty(this, "index"); //消息索引
    LocalContractStorage.defineProperty(this, "commision"); //手续费比例
    LocalContractStorage.defineMapProperty(this, "messages", { //当前参与用户 两两对决 
        parse: function (jsonText) {
            return new User(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

MSGContract.prototype = {

    init: function () {
        this.adminAddress = "n1ZyXGb1xvf3uNiFw18bKMizfavsNxQzx2X";
        this.msgCount = 0;
        this.index = 0;
        this.commision = 0.01;
    },
    //出售消息
    sellMsg: function (title, msg,amount) {
        var from = Blockchain.transaction.from;
        throw new Error(title + "--" + msg + "---" + amount);
        if (amount < 0) {
            throw new Error("amount can't be negative number.");
        }
        if (title == "" || msg == "") {
            throw new Error("content can't be null.");
        }
        this.index++;
        var msg = new Msg();
        msg.address = from;
        msg.title = title;
        msg.msg = msg;
        msg.amount = amount;
        msg.id = this.index;
        this.messages.put(this.msgCount, msg);
        this.msgCount++;
        return msg;
    },
    //购买消息
    buyMsg: function (id) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var msg = this._findMsg(id);
        if (msg == null) {
            throw new Error("no message here.");
        }
        if (value != msg.amount) {
            throw new Error("Sorry, please pay " + msg.amount + " NAS only.");
        }
        if (amount > 0) {
            this._transferAmount(msg.address, amount * (1.0 - this.commision));//给卖家打钱
            this._transferAmount(this.adminAddress, amount * (1.0 - this.commision));//手续费
        }
        return msg;
    },
    //获取消息列表
    getMsgList: function () {
        var list = new Array();
        for (var i = 0; i < this.msgCount; i++) {
            var msg = this.messages.get(i);
            var obj = new object();
            obj.title = msg.title;
            obj.id = msg.id;
            obj.amount = msg.amount;
            list.push(obj);
        }
        return list;
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
    //查找一次
    _findMsg: function (id) {
        for (var i = 0; i < this.msgCount; i++) {
            var msg = this.messages.get(i);
            if (msg.id == id) {
                this.msgCount--;
                this.messages.del(i);
                return msg;
            }
        }
        return null;
    }
};

module.exports = MSGContract;