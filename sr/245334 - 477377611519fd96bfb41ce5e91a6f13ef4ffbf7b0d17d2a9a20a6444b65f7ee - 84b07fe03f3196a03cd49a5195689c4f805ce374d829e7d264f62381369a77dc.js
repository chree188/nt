"use strict";
var ClockInItem = function (data) {
    if (data) {
        var obj = JSON.parse(data);
        this.staffAddress = obj.staffAddress;
        this.clockInTimeStamp = obj.clockInTimeStamp;
    } else {
        this.staffAddress = '';
        this.clockInTimeStamp = '';
    }
};
ClockInItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ClockIn = function () {
    LocalContractStorage.defineProperty(this, "recordCount");
    LocalContractStorage.defineMapProperty(this, "data");
};
ClockIn.prototype = {
    init: function () {
        this.recordCount = 0;
    },

    queryClockInCount: function () {
        return this.recordCount;
    },
    add: function(){
        this.recordCount = this.recordCount + 1;
        return this.recordCount;
    },
    queryClockInList: function (page, size) {
        var result = [];
        if (this.recordCount == 0) {
            return result;
        } else if ((page - 1) * size > this.recordCount) {
            throw new Error("out of range");
        }
        var startNum = (page - 1) * size;
        for (var i = 0; i < size; i++) {
            var obj = this.data.get(startNum + i);
            if (obj != null) {
                result.push(obj);
            }
        }
        return result;
    },
    addClockIn: function () {
        var clockInItem = new ClockInItem();
        clockInItem.staffAddress = Blockchain.transaction.from;
        clockInItem.clockInTimeStamp = Blockchain.transaction.timestamp;
        this.data.put(this.recordCount, clockInItem);
        this.recordCount = this.recordCount + 1;
        return true;
    }
};
module.exports = ClockIn;