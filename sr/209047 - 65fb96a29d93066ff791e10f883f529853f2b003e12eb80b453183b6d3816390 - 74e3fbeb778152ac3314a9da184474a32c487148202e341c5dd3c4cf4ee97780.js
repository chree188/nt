'use strict';

var SampleContract = function() {
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineMapProperty(this, "timeStamp")
    LocalContractStorage.defineProperty(this, "size");
};

SampleContract.prototype = {
    init: function() {
        this.size = 0;
    },

    set: function(value) {
        var index = this.size;
        this.dataMap.set(index, value);
        this.timeStamp.set(index, Blockchain.transaction.timestamp)
        this.size += 1;
    },

    getDataMap: function(key) {
        return this.dataMap.get(key);
    },
    getTime: function(key) {
        return this.timeStamp.get(key);
    },

    len: function() {
        return this.size;
    },

    forEach: function() {
        var result = "";
        for (var i = 0; i < this.size; i++) {
            var objectData = this.dataMap.get(i);
            var objectTime = this.timeStamp.get(i);
            result += "   " + objectData + " *timestamp:*" + objectTime + ";  ";
        }
        return result;
    }
};

module.exports = SampleContract;