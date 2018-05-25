"use strict";

var Register = function() {
    LocalContractStorage.defineMapProperty(this, "dataMap");
};

Register.prototype = {
    init: function() {
    },

    save: function() {
var registerTime = Blockchain.transaction.timestamp;
var address = Blockchain.transaction.from;
var obj = new Object();
obj.registerTime = registerTime;
var temp = this.dataMap.get(address);
var attendanceArr = [];
if(temp != null){
attendanceArr = JSON.parse(temp);
}
attendanceArr.push(obj);
        this.dataMap.set(address, JSON.stringify(attendanceArr));

    },
    get: function() {
var address = Blockchain.transaction.from;
var temp = this.dataMap.get(address);
var attendanceArr = [];
if(temp != null){
attendanceArr = JSON.parse(temp);
}
        return attendanceArr;
    },
};

module.exports = Register;
