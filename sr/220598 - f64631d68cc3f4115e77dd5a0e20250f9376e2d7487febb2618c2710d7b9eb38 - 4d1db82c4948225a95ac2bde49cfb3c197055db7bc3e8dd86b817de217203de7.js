'use strict';

var Contract = function () {
    LocalContractStorage.defineProperty(this, "limit", null);
    LocalContractStorage.defineProperty(this, "creator", null);
    LocalContractStorage.defineProperty(this, "chatArray");
}

Contract.prototype = {
    init: function (limit) {
        this.limit = new BigNumber(limit);
        this.creator = Blockchain.transaction.from;
        this.chatArray = []
        return this.chatArray;
    },
    send: function (message) {
        let chatArray = this.chatArray;
        var from = Blockchain.transaction.from;
        chatArray.push([from, message]);
        if (chatArray.length > this.limit) {
            chatArray.reverse()
            chatArray.pop();
            chatArray.reverse()
        }
        this.chatArray = chatArray;
        return chatArray.length;
    }
    ,
    chatMap: function () {
        return this.chatArray;
    }
    ,
    takeout: function (amount) {
        var from = Blockchain.transaction.from;
        let value = new BigNumber(amount);
        if (from == this.creator) {
            var result = Blockchain.transfer(from, value);
            if (!result) {
                throw new Error("transfer failed.");
            }
            Event.Trigger("BankVault", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: from,
                    value: value.toString()
                }
            });
        }
    }
}

module.exports = Contract;