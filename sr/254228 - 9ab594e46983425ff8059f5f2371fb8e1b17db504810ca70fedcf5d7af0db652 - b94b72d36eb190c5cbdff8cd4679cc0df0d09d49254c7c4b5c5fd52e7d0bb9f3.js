"use strict";

var RedPacketItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.from = obj.from;
        this.amount = new BigNumber(obj.amount);
        this.count = new BigNumber(obj.count);
        this.users = obj.users;
        this.type = obj.type;
        this.message = obj.message;
    } else {
        this.key = "";
        this.from = "";
        this.amount = new BigNumber(0);
        this.count = new BigNumber(0);
        this.users = [];
        this.type = 0;
        this.message = "";
    }
};

RedPacketItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var RedPacket = function () {
    LocalContractStorage.defineMapProperty(this, "TokenRedpacekts", {
        parse: function (text) {
            return new RedPacketItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "NormalRedpacekts", {
        parse: function (text) {
            return new RedPacketItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "UsersPackets");
};

RedPacket.prototype = {
    init: function () {

    },
    
    packNormalRedPacket: function (target, message) {
        if (!Blockchain.verifyAddress(target))
        {
            throw new Error("接收者地址格式不正确");
        }

        if (message.length > 256){
            throw new Error("留言长度超出限制")
        }

        var amount = Blockchain.transaction.value;
        if (amount.lte(0)){
            throw new Error("红包金额必须大于0");
        }

        var packet = new RedPacketItem();
        packet.message = message;
        packet.amount = amount;
        packet.from = Blockchain.transaction.from;
        packet.type = 0;

        this.NormalRedpacekts.put(Blockchain.transaction.hash, packet);
        var userPackets = this.UsersPackets.get(target);
        if(!userPackets)
        {
            userPackets = [];
        }
        userPackets.push(Blockchain.transaction.hash);
        this.UsersPackets.put(target, userPackets);
    },

    unpackNormalRedPacket: function () {
        if (Blockchain.transaction.value.gt(0)){
            throw new Error("拆红包可不用钱");
        }
        var target = Blockchain.transaction.from;
        var userPackets = this.UsersPackets.get(target);
        if(!userPackets || userPackets.length == 0)
        {
            throw new Error("没有可领取的红包");
        }
        var result = [];
        var hash = '';
        var newUserPackets = [];
        while (hash = userPackets.pop())
        {
            var pacekt = this.NormalRedpacekts.get(hash);

            var TransResult = Blockchain.transfer(target, pacekt.amount);
            if (!TransResult) {
                newUserPackets.push(hash);
                continue;
            }

            Event.Trigger("RedPacket", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: target,
                    value: pacekt.amount
                }
            });

            this.NormalRedpacekts.del(hash);
            result.push(pacekt);
        }
        if(result.length == 0)
        {
            throw new Error(newUserPackets.length + "个红包领取失败！");
        }
        this.UsersPackets.put(target, newUserPackets);
        return result;
    },

    checkNormalRedPacket: function () {
        if (Blockchain.transaction.value.gt(0)){
            throw new Error("看红包可不用钱");
        }
        var target = Blockchain.transaction.from;
        var userPackets = this.UsersPackets.get(target);
        if(!userPackets)
        {
            return 0;
        }
        return userPackets.length;
    },

    packTokenRedPacket: function (key, count, random) {
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
        var amount;
        if(random)
        {
            amount = Blockchain.transaction.value;
        }
        else
        {
            amount = Blockchain.transaction.value.dividedBy(countN);
        }
        if (amount.lte(0)){
            throw new Error("红包金额必须大于0");
        }

        if (amount.gt(Blockchain.transaction.value)){
            throw new Error("红包金额错误");
        }

        var packet = this.TokenRedpacekts.get(key);
        if (packet){
            throw new Error("红包口令已存在");
        }

        packet = new RedPacketItem();
        packet.key = key;
        packet.amount = amount;
        packet.count = countN;
        packet.from = from;
        packet.type = random ? 2 : 1;

        this.TokenRedpacekts.put(key, packet);
    },

    unpackTokenRedPacket: function (key) {
        if (Blockchain.transaction.value.gt(0)){
            throw new Error("拆红包可不用钱");
        }
        key = key.trim();
        if ( key === "" ) {
            throw new Error("口令不能为空")
        }
        var packet = this.TokenRedpacekts.get(key);
        if (!packet){
            throw new Error("红包口令不存在");
        }

        var from = Blockchain.transaction.from;
        if(packet.users.lastIndexOf(from) != -1)
        {
            throw new Error("你已经领过该红包了");
        }

        var amount = packet.amount;
        if (packet.type == 2)
        {
            if(packet.count.eq(1))
            {
                amount = packet.amount;
            }
            else
            {
                var hashNum = new BigNumber(Blockchain.transaction.hash, 16);
                var limit;
                if(hashNum.mod(2).eq(0))
                {
                    limit = amount.divToInt(packet.count);
                }
                else
                {
                    var countmod = packet.count.divToInt(10);
                    if(countmod.lte(1))
                    {
                        limit = amount;
                    }
                    else
                    {
                        limit = amount.divToInt(countmod);
                    }
                }
                amount = hashNum.mod(limit);
                if(amount.eq(packet.amount))
                {
                    amount = amount.divToInt(2);
                }
            }
            packet.amount = packet.amount.sub(amount);
        }

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
            this.TokenRedpacekts.del(key);
        } else {
            packet.users.push(from);
            this.TokenRedpacekts.put(key, packet);
        }
        return amount;
    },

    checkTokenRedPacket: function (key) {
        if (Blockchain.transaction.value.gt(0)){
            throw new Error("看红包可不用钱");
        }
        key = key.trim();
        if ( key === "" ) {
            throw new Error("口令不能为空")
        }
        var packet = this.TokenRedpacekts.get(key);
        if (!packet){
            throw new Error("红包口令不存在");
        }
        return packet;
    }
};
module.exports = RedPacket;