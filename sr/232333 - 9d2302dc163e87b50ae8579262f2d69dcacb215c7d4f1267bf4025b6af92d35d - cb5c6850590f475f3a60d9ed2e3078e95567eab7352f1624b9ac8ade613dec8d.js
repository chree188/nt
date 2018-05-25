"use strict";

var RedPacketItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.from = obj.from;
        this.amount = new BigNumber(obj.amount);
        this.count = new BigNumber(obj.count);
        this.users = obj.users;
    } else {
        this.key = "";
        this.from = "";
        this.amount = new BigNumber(0);
        this.count = new BigNumber(0);
        this.users = [];
    }
};

RedPacketItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var RedPacket = function () {
    LocalContractStorage.defineMapProperty(this, "redpacekts", {
        parse: function (text) {
            return new RedPacketItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

RedPacket.prototype = {
    init: function () {

    },

    packRedPacket: function (key, count) {
        key = key.trim();
        if (key === "" ){
            throw new Error("口令不能为空");
        }
        var countN = new BigNumber(count).floor()
        if (countN.lte(0)){
            throw new Error("红包数量必须大于0");
        }

        if (countN.gt(100)){
            throw new Error("红包数量必须小于等于100");
        }

        if (key.length > 256){
            throw new Error("口令长度超出限制")
        }

        var from = Blockchain.transaction.from;
        var amount = Blockchain.transaction.value.dividedBy(countN);
        if (amount.lte(0)){
            throw new Error("红包金额必须大于0");
        }

        if (amount.gt(Blockchain.transaction.value)){
            throw new Error("红包金额错误");
        }

        var packet = this.redpacekts.get(key);
        if (packet){
            throw new Error("红包口令已存在");
        }

        packet = new RedPacketItem();
        packet.key = key;
        packet.amount = amount;
        packet.count = countN;
        packet.from = from;

        this.redpacekts.put(key, packet);
    },

    unpackRedPacket: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("口令不能为空")
        }
        var packet = this.redpacekts.get(key);
        if (!packet){
            throw new Error("红包口令不存在");
        }

        var from = Blockchain.transaction.from;
        if(packet.users.lastIndexOf(from) != -1)
        {
            throw new Error("你已经领过该红包了");
        }

        var amount = packet.amount;
        var result = Blockchain.transfer(from, amount);
        if (!result) {
            throw new Error("转账失败");
        }

        Event.Trigger("RedPacket", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount
            }
        });

        packet.count = packet.count.sub(1);
        if(packet.count.lte(0)) {
            this.redpacekts.del(key);
        } else {
            packet.users.push(from);
            this.redpacekts.put(key, packet);
        }
    },

    checkRedPacket: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("口令不能为空")
        }
        var packet = this.redpacekts.get(key);
        if (!packet){
            throw new Error("红包口令不存在");
        }
        return packet;
    }
};
module.exports = RedPacket;