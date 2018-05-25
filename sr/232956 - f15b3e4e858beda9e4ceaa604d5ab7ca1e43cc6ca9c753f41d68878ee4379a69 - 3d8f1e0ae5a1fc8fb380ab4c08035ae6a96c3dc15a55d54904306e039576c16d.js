"use strict";

var Ious = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.debtor = obj.debtor;
        this.debtorAddr = obj.debtorAddr;
        this.borrow = obj.borrow;
        this.borrowAddr = obj.borrowAddr;
        this.repayDate = obj.repayDate;
        this.loan = obj.loan;
        this.note = obj.note;
        this.isSignA = obj.isSignA;
        this.isSignB = obj.isSignB;
        this.id = obj.id; //自增
    } else {
        this.debtor = "";
        this.debtorAddr = "";
        this.borrow = "";
        this.borrowAddr = "";
        this.repayDate = "";
        this.loan = "";
        this.note = "";
        this.isSignA = "";
        this.isSignB = "";
        this.id = "";
    }
};

Ious.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var IousTool = function() {
    //欠条总数量idx为key
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new Ious(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    //当前总数量
    LocalContractStorage.defineProperty(this, "iousSize");
    //key为借方公钥，value对应总共欠条
    LocalContractStorage.defineMapProperty(this, "debtorMap");
    //key为欠方公钥，value对应总共欠条
    LocalContractStorage.defineMapProperty(this, "borrowMap");
    //key为借方公钥结合索引，value对应欠条id
    LocalContractStorage.defineMapProperty(this, "debtorIds");
    //key为欠方公钥结合索引，value对应欠条id
    LocalContractStorage.defineMapProperty(this, "borrowIds");
};

IousTool.prototype = {
    init: function() {
        this.iousSize = 0;
    },

    add: function(debtor, borrow, borrowAddr, repayDate, loan, note) {
        var debtorAddr = Blockchain.transaction.from;

        var ious = new Ious();
        ious.debtor = debtor;
        ious.debtorAddr = debtorAddr;
        ious.borrow = borrow;
        ious.borrowAddr = borrowAddr;
        ious.repayDate = repayDate;
        ious.loan = loan;
        ious.note = note;
        ious.isSignA = 1;
        ious.isSignB = 0;
        ious.id = this.iousSize;
        this.repo.put(this.iousSize, ious);
        this.iousSize++;

        var curA = this.debtorMap.get(debtorAddr);
        if (curA) {
            this.debtorMap.put(debtorAddr, curA + 1);
        } else {
            this.debtorMap.put(debtorAddr, 1);
            curA = 0;
        }

        var curB = this.borrowMap.get(borrowAddr);
        if (curB) {
            this.borrowMap.put(borrowAddr, curB + 1);
        } else {
            this.borrowMap.put(borrowAddr, 1);
            curB = 0;
        }

        var keyA = debtorAddr + ":" + curA;

        this.debtorIds.put(keyA, ious.id);

        var keyB = borrowAddr + ":" + curB;

        this.borrowIds.put(keyB, ious.id);
    },

    getAlen: function() {
        var from = Blockchain.transaction.from;
        var len = this.debtorMap.get(from);
        if (len) {
            return { "len": len, "from": from };
        } else {
            return { "len": 0, "from": from };
        }
    },

    getAId: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.debtorIds.get(key);
    },

    getBlen: function() {
        var from = Blockchain.transaction.from;
        var len = this.borrowMap.get(from);
        if (len) {
            return { "len": len, "from": from };
        } else {
            return { "len": 0, "from": from };
        }
    },

    getBId: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.borrowIds.get(key);
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },

    sign: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        var from = Blockchain.transaction.from;
        var ious = this.repo.get(key);
        if (ious.borrowAddr != from) {
            throw new Error("错误的欠款方");
        }
        ious.isSignB = 1;
        this.repo.put(ious.id, ious);
    }
};
module.exports = IousTool;