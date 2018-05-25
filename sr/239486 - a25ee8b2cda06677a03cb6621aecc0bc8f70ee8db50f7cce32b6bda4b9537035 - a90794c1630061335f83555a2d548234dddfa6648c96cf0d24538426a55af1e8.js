"use strict";

var HistoryContract = function() {
    //储存日期与当日的记录条数
    LocalContractStorage.defineMapProperty(this, "dateMap");
    //储存具体的每一条记录信息
    LocalContractStorage.defineMapProperty(this, "infoMap");
};

HistoryContract.prototype = {
    init: function() {
        this.control = "n1VNHJjUibTJtwLhAn8L3PJiKcLwFZGYJ5j";
    },

    //更新当天的索引号 新增内容
    set: function(day, info) {
        var daycount = this.dateMap.get(day);
        if (!daycount) {
            daycount = 1;
        } else {
            daycount += 1;
        }
        this.dateMap.set(day, daycount);
        this.infoMap.set(day+":"+daycount, Blockchain.transaction.from + "[send]" + info);
        return true;
    },

    //先读取当天的条数，再读取内容
    get: function(day) {
        var daycount = this.dateMap.get(day);
        if (!daycount) {
            return false;
        } else {
            var result = [];
            for (var i = 1; i <= daycount; i++) {
                var object = this.infoMap.get(day+":"+i);
                var temp = {
                    key: day+":"+i,
                    value: object
                }
                result.push(temp);
            }
            return JSON.stringify(result);
        }
    },

    //控制者可以覆盖infoMap某条有问题的数据
    cover: function (key, info) {
        if (Blockchain.transaction.from == this.control) {
            this.infoMap.set(key, info);
            return true;
        } else {
            return false;
        }
    },

    //转出
    transferout: function(amount) {
        return Blockchain.transfer("n1VNHJjUibTJtwLhAn8L3PJiKcLwFZGYJ5j", amount);
    },
};

module.exports = HistoryContract;