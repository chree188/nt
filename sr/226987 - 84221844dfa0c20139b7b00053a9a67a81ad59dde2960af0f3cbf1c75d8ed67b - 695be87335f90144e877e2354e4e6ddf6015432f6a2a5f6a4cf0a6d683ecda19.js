"use strict";

var RedEnvelope = function(text) {

    if (text) {
        var obj = JSON.parse(text);
        // 红包主键
        this.id = obj.id;
        // nas 个数
        this.nas = new BigNumber(obj.nas);
        // 实际 nas 个数
        this.actualNas = new BigNumber(obj.actualNas);
        // 接收红包的人数
        this.recieveCount = new BigNumber(obj.recieveCount);
        // 红包总个数
        this.redEnvelopeCount = new BigNumber(obj.redEnvelopeCount);
        // 内容
        this.content = obj.content;
        // 昵称
        this.nick = obj.nick;
        // 状态
        this.status = obj.status;
        // 发起红包人的地址
        this.address = obj.address;
        // 红包创建时间
        this.date = obj.date;
        // 领取记录
        this.record = obj.record;
    } else {
        this.id = "";
        this.nas = new BigNumber(0);
        this.actualNas = new BigNumber(0);
        this.recieveCount = new BigNumber(0);
        this.redEnvelopeCount = new BigNumber(0);
        this.content = "";
        this.nick = "";
        // status 状态为0代表进行中, 1代表已经领取完成
        this.status = 0;
        this.address = "";
        this.date = "";
        this.record = [];
    }
};

RedEnvelope.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// 好友记录
var FriendRecord = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        // 好友记录主键
        this.id = obj.id;
        // 红包id
        this.redEnvelopeId = obj.redEnvelopeId;
        // 好友领取nas数量
        this.nas = new BigNumber(obj.nas);
        // 好友地址
        this.address = obj.address;
    } else {
        this.id = "";
        this.redEnvelopeId = "";
        this.nas = new BigNumber(0);
        this.address = "";
    }

};

FriendRecord.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var LuckyMoney = function () {
    LocalContractStorage.defineMapProperty(this, "redEnvelope", {
        parse: function (text) {
            return new RedEnvelope(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LuckyMoney.prototype = {
    init: function () {
    },

    saveRedEnvelope: function (redEnvelopeCount, content, nick, date) {
        content = content.trim();
        nick = nick.trim();

        var nas = new BigNumber(Blockchain.transaction.value).times(new BigNumber(10).pow(18));

        if (content.length > 64 || nick.length > 64) {
            throw new Error("nick / content exceed limit length");
        }

        var from = Blockchain.transaction.from;
        var id = Blockchain.transaction.hash + "-";

        var redEnvelope = new RedEnvelope();
        redEnvelope.id = id;
        redEnvelope.nas = nas;
        redEnvelope.recieveCount = 0;
        redEnvelope.redEnvelopeCount = redEnvelopeCount;
        redEnvelope.content = content;
        redEnvelope.nick = nick;
        redEnvelope.address = from;
        redEnvelope.status = 0;
        redEnvelope.date = date;
        redEnvelope.record = [];

        var amount = nas * 0.01;

        Blockchain.transfer("n1F39KaX33cw2Nx4d4BuFicFLAbUTAtXecy", amount);

        redEnvelope.actualNas = nas - amount;

        this.redEnvelope.put(id, redEnvelope);

        return id;
    },
    getRedEnvelope: function(id) {
      return this.redEnvelope.get(id)
    },
    
    saveFriendRecord: function(id) {
        // 获取当前红包
        var redEnvelope = this.redEnvelope.get(id);

        // 剩余的红包数量
        var difference = redEnvelope.redEnvelopeCount.sub(redEnvelope.recieveCount);

        var from = Blockchain.transaction.from;

        if (difference > 0) {
            var friendRecordId = id.substring(31, 64) + from.substring(31, 64);

            var record = this.friendRecord.get(friendRecordId);

            if (record) {
                throw new Error("current user received");
            }

            var friendRecord = new FriendRecord();
            friendRecord.address = from;
            friendRecord.id = friendRecordId;
            friendRecord.redEnvelopeId = id;

            if (difference <= 1) {

                friendRecord.nas = redEnvelope.actualNas;

                redEnvelope.status = 1;
                redEnvelope.recieveCount = redEnvelope.redEnvelopeCount;
                redEnvelope.actualNas = 0;
                redEnvelope.record.push(friendRecord);

                Blockchain.transfer(from, friendRecord.nas);
                this.redEnvelope.put(id, redEnvelope);

                return this.redEnvelope.get(id);
            }
            var r = this.random();
            var min = 0.01;
            var max = redEnvelope.actualNas; // 剩余nas数量
            var money = r * max;
            money = money <= min ? 0.01: money;
            money = Math.floor(money * 100) / 100;

            redEnvelope.recieveCount = redEnvelope.recieveCount + 1;
            redEnvelope.actualNas = redEnvelope.actualNas - money;
            redEnvelope.record.push(friendRecord);

            this.redEnvelope.put(id, redEnvelope);

            friendRecord.nas = redEnvelope.actualNas;
            redEnvelope.record.push(friendRecord);

            Blockchain.transfer(from, friendRecord.nas);

            this.redEnvelope.put(id, redEnvelope);

            return this.redEnvelope.get(id);
        } else {
            return "none";
        }
    }

};

module.exports = LuckyMoney;