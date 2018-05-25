"use strict";

var SingleRecord = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.creator = obj.creator;
        this.record = obj.record;
        this.createTime = obj.createTime;
    } else {
        this.creator = '';
        this.record = 0;
        this.createTime = '';
    }
};

SingleRecord.prototype = {
	toString: function () {
        return JSON.stringify(this);
      }
};

var Runner = function () {
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

Runner.prototype = {
    init: function () {
        this.size = 0;
    },
    postRecord: function (recordNum) {
        var author = Blockchain.transaction.from;
        var srecord = new SingleRecord();
        srecord.creator = author;
        srecord.record = recordNum;
        srecord.createTime = (Date.now()).toString();

        var index = this.size;
        this.dataMap.set(index, JSON.stringify(srecord));
        this.size += 1;
    },
    get: function (key) {
        return JSON.parse(this.dataMap.get(key));
    },

    len: function () {
        return this.size;
    },
    forEach: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }

        var resArray = [];
        for (var i = offset; i < number; i++) {
            var object = JSON.parse(this.dataMap.get(i));
            resArray.push(object);
        }
        return resArray;
    }
};
module.exports = Runner;