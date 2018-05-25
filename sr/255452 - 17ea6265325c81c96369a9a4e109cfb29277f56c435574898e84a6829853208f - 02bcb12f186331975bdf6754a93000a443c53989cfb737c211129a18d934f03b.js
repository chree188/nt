"use strict";

var Record = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.addrA = obj.addrA;
        this.addrB = obj.addrB;
        this.begin = obj.begin;
        this.lastTimeA = obj.lastTimeA;
        this.lastTimeB = obj.lastTimeB;
        this.hold = obj.hold;
        this.id = obj.id; //自增
    } else {
        this.name = "";
        this.addrA = "";
        this.addrB = "";
        this.begin = "";
        this.lastTimeA = "";
        this.lastTimeB = "";
        this.hold = "";
        this.id = ""; //自增
    }
};

Record.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var RecordTool = function() {
    //打卡总Map
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new Record(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    //打卡名称汇总Map
    LocalContractStorage.defineMapProperty(this, "nameMap");
    //不同名称数量
    LocalContractStorage.defineProperty(this, "nameSize");
    //名称索引
    LocalContractStorage.defineMapProperty(this, "nameKey");
    //当前总数量
    LocalContractStorage.defineProperty(this, "recordSize");
    //key为addr1，value对应总的打卡数量
    LocalContractStorage.defineMapProperty(this, "sumAMap");
    //key为addr2，value对应总的打卡数量
    LocalContractStorage.defineMapProperty(this, "sumBMap");
    //key为addr1的索引，value对应打卡的id
    LocalContractStorage.defineMapProperty(this, "addrAIds");
    //key为addr2的索引，value对应打卡的id
    LocalContractStorage.defineMapProperty(this, "addrBIds");
};

RecordTool.prototype = {
    init: function() {
        this.recordSize = 0;
        this.nameSize = 0;
    },

    add: function(name, addrB) {
        name = name.trim();
        var addrA = Blockchain.transaction.from;
        addrB = addrB.trim();
        if (addrB === addrA) {
            throw new Error("不能添加自己的账户地址，can not set your own address")
        }
        var begin = Blockchain.transaction.timestamp;
        var lastTimeA = begin - 60 * 60 * 24;
        var lastTimeB = begin - 60 * 60 * 24;

        var record = new Record();
        record.name = name;
        record.addrA = addrA;
        record.addrB = addrB;
        record.begin = begin;
        record.lastTimeA = lastTimeA;
        record.lastTimeB = lastTimeB;
        record.hold = 0;
        record.id = this.recordSize;
        this.repo.put(this.recordSize, record);
        this.recordSize++;

        var nameSum = this.nameMap.get(name);
        if (nameSum) {
            this.nameMap.put(name, nameSum + 1);
        } else {
            this.nameMap.put(name, 1);
            this.nameKey.put(this.nameSize, name);
            this.nameSize++;
        }

        var curA = this.sumAMap.get(addrA);
        if (curA) {
            this.sumAMap.put(addrA, curA + 1);
        } else {
            this.sumAMap.put(addrA, 1);
            curA = 0;
        }

        var curB = this.sumBMap.get(addrB);
        if (curB) {
            this.sumBMap.put(addrB, curB + 1);
        } else {
            this.sumBMap.put(addrB, 1);
            curB = 0;
        }

        var keyA = addrA + ":" + curA;

        this.addrAIds.put(keyA, record.id);

        var keyB = addrB + ":" + curB;

        this.addrBIds.put(keyB, record.id);
    },

    getNameSize: function() {
        var from = Blockchain.transaction.from;
        return { "len": this.nameSize, "from": from };
    },

    getName: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.nameKey.get(key);
    },

    getNameSum: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return { "name": key, "sum": this.nameMap.get(key) };
    },

    getAlen: function() {
        var from = Blockchain.transaction.from;
        var len = this.sumAMap.get(from);
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
        return this.addrAIds.get(key);
    },

    getBlen: function() {
        var from = Blockchain.transaction.from;
        var len = this.sumBMap.get(from);
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
        return this.addrBIds.get(key);
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },

    mark: function(key, hold) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var record = this.repo.get(key);
        if (record.addrA == from) {
            record.lastTimeA = timestamp;
            record.hold = hold;
        } else if (record.addrB == from) {
            record.lastTimeB = timestamp;
            record.hold = hold;
        } else {
            throw new Error("错误的账户");
        }
        this.repo.put(record.id, record);
    }
};
module.exports = RecordTool;