"use strict";

var Record = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.address = obj.address;
        this.timestamp = Blockchain.transaction.timestamp;
        this.point = obj.point;
    } else {
        this.id = 0;
        this.address = "";
        this.timestamp = "";
        this.point = 0;
    }

};

Record.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TetrisContract = function () {
    LocalContractStorage.defineMapProperty(this, "records", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (text) {
            return new Record(text);
        }
    });

    LocalContractStorage.defineProperty(this, "size");

};

TetrisContract.prototype = {
    init: function () {
        this.size = 0;
    },
    getRecord: function () {
        var addr = Blockchain.transaction.from;
        for(var i=0; i<this.size; i++){
            var record = this.records.get(i);
            if(record.address == addr){
                return record;
            }
        }
        return null;
    },
    getRankingList: function () {
        //取所有记录的前五名
        var result  = [];
        var arr = this.records;
        var compare = function (obj1, obj2) {//比较函数
            var val1 = obj1.point;
            var val2 = obj2.point;
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
        arr.sort(compare);
        for(var i=0; i<5; i++){
            var object = arr[i];
            result.push(object);
        }
        return JSON.stringify(result);
    },
    setRocord: function(point){
        var addr = Blockchain.transaction.from;
        var flag = 0;
        for(var i=0; i<this.size; i++){
            var record = this.records.get(i);
            if(record.address == addr){
                if (parseInt(point) > parseInt(record.point)) {
                    var newRecord = new Record();
                    newRecord.id = i;
                    newRecord.address = addr;
                    newRecord.timestamp = Blockchain.transaction.timestamp;
                    newRecord.point = point;
                    this.records.set(i, newRecord);
                    flag = 1;
                    break;
                }
            }
        }
        if(flag == 0){
            var newRecord = new Record();
            newRecord.id = this.size;
            newRecord.address = addr;
            newRecord.timestamp = Blockchain.transaction.timestamp;
            newRecord.point = point;
            this.records.set(this.size, newRecord);
            this.size += 1;
        }
    },
    getLen :function () {
        return this.size;
    }
};

module.exports = TetrisContract;