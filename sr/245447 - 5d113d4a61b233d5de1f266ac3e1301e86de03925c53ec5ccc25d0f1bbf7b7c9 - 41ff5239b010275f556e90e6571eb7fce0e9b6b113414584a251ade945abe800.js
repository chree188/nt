"use strict";

//打卡记录实体
var ClockInItem = function (data) {
    if (data) {
        var obj = JSON.parse(data);
        this.clockInAddress = obj.clockInAddress;
        this.clockInTimeStamp = obj.clockInTimeStamp;
    } else {
        this.clockInAddress = '';
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

    //查询有多少条签到记录
    queryClockInCount: function () {
        return this.recordCount;
    },

    //查询记录
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
    queryClockInAllList: function(){
        var result = [];
        for(var i=1; i<=this.recordCount; i++){
            var obj = this.data.get(this.recordCount - 1 - i);
            if (obj != null) {
                result.push(obj);
            }
        }
        return result;
    },
    //新增考勤记录
    addClockIn: function () {
        var clockInItem = new ClockInItem();
        clockInItem.clockInAddress = Blockchain.transaction.from;
        clockInItem.clockInTimeStamp = Blockchain.transaction.timestamp;
        this.data.put(this.recordCount, clockInItem);
        this.recordCount = this.recordCount + 1;
        return true;
    }
};
module.exports = ClockIn;