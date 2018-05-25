"use strict";

var Account = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.addr = obj.addr;
        this.pointNum = obj.pointNum;
    } else {
        this.addr = "";
        this.pointNum = 0;
    }
};

Account.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var VoucherCenter = function() {
    LocalContractStorage.defineMapProperty(this, "accountRepo", {
        parse: function(text) {
            return new Account(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

VoucherCenter.prototype = {
    init: function() {

    },

    recharge: function() {
        var fromAddr = Blockchain.transaction.from;
        var amount = Blockchain.transaction.value;
        var account = this.accountRepo.get(fromAddr);
        if (account) {
            var newValue = account.pointNum+amount * 10000;
            account.pointNum = newValue;
        } else {
            account = new Account();
            account.addr = fromAddr;
            account.pointNum = 0;
            this.accountRepo.put(fromAddr, account);
        }
    },

    query: function(addr) {
        return this.accountRepo.get(addr);
    }
};
module.exports = VoucherCenter;